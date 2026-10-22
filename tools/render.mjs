// Markdown + KaTeX rendering shared by the build and the tests.
// Math is pulled out before Markdown parsing so underscores and backslashes
// inside formulas are never touched by the Markdown parser.
import katex from 'katex';
import { Marked } from 'marked';

const marked = new Marked({ gfm: true, breaks: false });

const BLOCK_TYPES = {
  formula: 'Formula',
  read: 'How to read it',
  steps: 'How to compute it',
  example: 'Worked example',
  tip: 'Tip',
  pitfall: 'Common mistake',
  exam: 'Exam focus',
  intuition: 'Intuition',
  note: 'Note',
};

function renderMath(tex, displayMode, where) {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: true,
      strict: 'ignore',
      trust: false,
      macros: { '\\R': '\\mathbb{R}', '\\argmax': '\\operatorname*{arg\\,max}', '\\argmin': '\\operatorname*{arg\\,min}' },
    });
  } catch (err) {
    throw new Error(`KaTeX error in ${where}: ${err.message}\n  source: ${tex}`);
  }
}

// Replace $$...$$ and $...$ with placeholders, render the Markdown, then put
// the rendered math back.
export function md(src, where = 'content', { inline = false } = {}) {
  const math = [];
  const stash = (html) => `MATHPH${math.push(html) - 1}XEND`;
  let text = String(src).replace(/\\\$/g, 'DOLLARPHX');
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => `\n\n${stash(renderMath(tex.trim(), true, where))}\n\n`);
  text = text.replace(/\$([^$\n]+?)\$/g, (_, tex) => stash(renderMath(tex.trim(), false, where)));
  if (/\$/.test(text)) throw new Error(`Unbalanced $ in ${where}: ${text.slice(text.indexOf('$') - 60, text.indexOf('$') + 60)}`);
  let html = inline ? marked.parseInline(text) : marked.parse(text);
  html = html.replace(/<p>\s*(MATHPH\d+XEND)\s*<\/p>/g, '$1');
  html = html.replace(/MATHPH(\d+)XEND/g, (_, i) => math[Number(i)]);
  return html.replace(/DOLLARPHX/g, '$');
}

// Theory pages: Markdown with ":::type Optional title" ... ":::" containers.
// Containers may nest one level (e.g. steps inside example).
export function renderTheory(src, where) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const stack = [];
  let buf = [];
  const flush = () => {
    if (buf.length) out.push(md(buf.join('\n'), where));
    buf = [];
  };
  for (const line of lines) {
    const open = line.match(/^:::(\w+)\s*(.*)$/);
    if (open && BLOCK_TYPES[open[1]]) {
      flush();
      const [, type, title] = open;
      stack.push(type);
      const label = title ? md(title, where, { inline: true }) : '';
      if (type === 'steps' || type === 'example') {
        out.push(`<details class="box box-${type}" open><summary><span class="box-kind">${BLOCK_TYPES[type]}</span>${label ? `<span class="box-title">${label}</span>` : ''}</summary><div class="box-body">`);
      } else {
        out.push(`<div class="box box-${type}"><div class="box-head"><span class="box-kind">${BLOCK_TYPES[type]}</span>${label ? `<span class="box-title">${label}</span>` : ''}</div><div class="box-body">`);
      }
      continue;
    }
    if (/^:::\s*$/.test(line)) {
      flush();
      const type = stack.pop();
      if (!type) throw new Error(`Unmatched ::: in ${where}`);
      out.push(type === 'steps' || type === 'example' ? '</div></details>' : '</div></div>');
      continue;
    }
    buf.push(line);
  }
  flush();
  if (stack.length) throw new Error(`Unclosed :::${stack.join(', ')} in ${where}`);
  return out.join('\n');
}

// Split a theory page into sections on "## " headings so the app can build a
// table of contents. Returns [{id, title, html}].
export function theorySections(src, where) {
  const parts = src.replace(/\r\n/g, '\n').split(/^## /m);
  const intro = parts.shift().trim();
  const sections = [];
  if (intro) sections.push({ id: 'overview', title: 'Overview', html: renderTheory(intro, where) });
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const title = part.slice(0, nl).trim();
    const body = part.slice(nl + 1);
    const id = title.toLowerCase().replace(/<[^>]+>/g, '').replace(/\$[^$]*\$/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    sections.push({ id, title: md(title, where, { inline: true }), titleText: title.replace(/\$/g, ''), html: renderTheory(body, `${where} § ${title}`) });
  }
  return sections;
}
