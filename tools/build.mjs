// Builds dist/: renders theory Markdown and the practice bank to HTML (with
// KaTeX, so a bad formula fails the build), then copies the static assets.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { md, theorySections } from './render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

export function parseFrontmatter(src, file) {
  const m = src.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Missing frontmatter in ${file}`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  meta.num = Number(meta.num);
  return { meta, body: m[2] };
}

export function loadTheory() {
  const dir = join(root, 'content', 'theory');
  return readdirSync(dir).filter((f) => f.endsWith('.md')).sort().map((file) => {
    const { meta, body } = parseFrontmatter(readFileSync(join(dir, file), 'utf8'), file);
    for (const key of ['slug', 'title', 'short', 'summary']) if (!meta[key]) throw new Error(`${file}: missing ${key}`);
    return { ...meta, sections: theorySections(body, file) };
  });
}

export async function loadQuestions(lessonSlugs) {
  const dir = join(root, 'content', 'practice');
  const all = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
    const mod = await import(pathToFileURL(join(dir, file)).href);
    const { lesson, questions } = mod.default;
    if (!lessonSlugs.includes(lesson)) throw new Error(`${file}: unknown lesson ${lesson}`);
    for (const q of questions) all.push({ ...q, lesson, file });
  }
  const seen = new Set();
  return all.map((q) => {
    const where = `${q.file} › ${q.id}`;
    if (!q.id || seen.has(q.id)) throw new Error(`Duplicate or missing id: ${where}`);
    seen.add(q.id);
    if (!['mcq', 'numeric', 'written'].includes(q.type)) throw new Error(`Bad type: ${where}`);
    if (!q.source || !['hw', 'variant', 'slide', 'quiz'].includes(q.source.kind) || !q.source.label) throw new Error(`Bad source: ${where}`);
    if (!q.prompt || !q.solution) throw new Error(`Missing prompt/solution: ${where}`);
    // A LaTeX command in a normal (non-String.raw) string loses its backslash
    // or turns into a control character such as \f or \b.
    const texts = [q.prompt, q.solution, ...(q.options || []), ...(q.fields || []).map((f) => f.label)];
    if (texts.some((t) => /[\b\f\v]/.test(t) || /(^|[^\\a-z])(frac|mathbf|kappa|sigma|lambda|alpha|theta)\{?\(/.test(t))) {
      throw new Error(`Lost LaTeX backslash (use String.raw): ${where}`);
    }
    const out = {
      id: q.id,
      lesson: q.lesson,
      type: q.type,
      source: q.source,
      noExam: Boolean(q.noExam),
      prompt: md(q.prompt, where),
      solution: md(q.solution, where),
    };
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`MCQ needs options: ${where}`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) throw new Error(`MCQ answer out of range: ${where}`);
      out.options = q.options.map((o, i) => md(o, `${where} option ${i}`, { inline: true }));
      out.answer = q.answer;
    }
    if (q.type === 'numeric') {
      if (!Array.isArray(q.fields) || !q.fields.length) throw new Error(`Numeric needs fields: ${where}`);
      out.fields = q.fields.map((f, i) => {
        if (typeof f.answer !== 'number' || !Number.isFinite(f.answer)) throw new Error(`Field ${i} answer not a number: ${where}`);
        const labelText = f.label
          .replace(/\\(?:text|mathrm|mathbf|operatorname)\{([^}]*)\}/g, '$1')
          .replace(/\\mid/g, '|').replace(/\\(?:prod|cdot)/g, ' ')
          .replace(/\\[a-zA-Z]+/g, '').replace(/[$\\{}^_]/g, '').replace(/\s+/g, ' ').trim();
        return { label: md(f.label, `${where} field ${i}`, { inline: true }), labelText, answer: f.answer, tol: f.tol };
      });
    }
    return out;
  });
}

async function build() {
  const lectures = loadTheory();
  const ordered = [...lectures].sort((a, b) => a.num - b.num);
  const questions = await loadQuestions(ordered.map((l) => l.slug));
  const data = {
    version: pkg.version,
    lectures: ordered.map(({ slug, num, title, short, summary, sourceNote, sections }) => ({ slug, num, title, short, summary, sourceNote, sections })),
    questions,
  };

  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, 'data.js'), `window.ML_DATA = ${JSON.stringify(data)};\n`);
  const html = readFileSync(join(root, 'src', 'index.html'), 'utf8').replaceAll('__VERSION__', pkg.version);
  writeFileSync(join(dist, 'index.html'), html);
  for (const f of ['styles.css', 'app.js', 'generators.js', 'favicon.svg']) copyFileSync(join(root, 'src', f), join(dist, f));
  const katexDist = join(root, 'node_modules', 'katex', 'dist');
  mkdirSync(join(dist, 'katex'), { recursive: true });
  copyFileSync(join(katexDist, 'katex.min.js'), join(dist, 'katex', 'katex.min.js'));
  copyFileSync(join(katexDist, 'katex.min.css'), join(dist, 'katex', 'katex.min.css'));
  cpSync(join(katexDist, 'fonts'), join(dist, 'katex', 'fonts'), { recursive: true });
  writeFileSync(join(dist, '.nojekyll'), '');

  const counts = {};
  for (const q of questions) counts[q.lesson] = (counts[q.lesson] || 0) + 1;
  console.log(`Built ${ordered.length} theory pages, ${questions.length} questions`);
  for (const l of ordered) console.log(`  ${l.slug.padEnd(22)} ${String(l.sections.length).padStart(2)} sections  ${counts[l.slug] || 0} questions`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((err) => { console.error(err.message); process.exit(1); });
}
