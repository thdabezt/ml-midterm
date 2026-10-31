/* ML Studyroom: hash-routed single page app. Content comes pre-rendered from
   data.js (window.ML_DATA); calculation drills come from generators.js. */
(function () {
  'use strict';

  const DATA = window.ML_DATA;
  const GEN = window.MLGen;
  const main = document.getElementById('main');
  const lectures = DATA.lectures;
  const questions = DATA.questions;
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const lessonBySlug = Object.fromEntries(lectures.map((l) => [l.slug, l]));
  const courseLessons = lectures.filter((l) => l.num > 0 && l.num < 99); // excludes toolkit and formula sheet

  /* ---------------- storage (never required for the page to work) ---------------- */
  const PREFIX = 'mlsr:';
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    },
  };
  let progress = store.get('progress', {});
  let bookmarks = store.get('bookmarks', {});
  const saveProgress = () => { store.set('progress', progress); updateReviewCount(); };
  const saveBookmarks = () => { store.set('bookmarks', bookmarks); updateReviewCount(); };
  function mark(id, status) { progress[id] = { status, at: Date.now() }; saveProgress(); }

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const LETTERS = 'ABCDEFGH';

  // Render $$..$$ / $..$ inside runtime-generated HTML (drills only; the rest is pre-rendered).
  function tex(html) {
    if (!window.katex) return html;
    const opts = (display) => ({ displayMode: display, throwOnError: false, strict: 'ignore', macros: { '\\R': '\\mathbb{R}' } });
    return String(html)
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => katex.renderToString(t.trim(), opts(true)))
      .replace(/\$([^$\n]+?)\$/g, (_, t) => katex.renderToString(t.trim(), opts(false)));
  }

  // Accepts 1.9, 1,9, -4/3, 2e-3, 0.5 (spaces ignored). Returns NaN if unreadable.
  function parseNumber(raw) {
    let s = String(raw).trim().replace(/\s+/g, '').replace(/−/g, '-').replace(/^≈/, '');
    if (!s) return NaN;
    if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.');
    const frac = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
    if (frac) return Number(frac[1]) / Number(frac[2]);
    if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
    return Number(s);
  }
  function closeEnough(value, field) {
    const tol = field.tol != null ? field.tol : Math.max(0.005, Math.abs(field.answer) * 0.01);
    return Math.abs(value - field.answer) <= tol + 1e-12;
  }
  const fmt = (x) => (Number.isInteger(x) ? String(x) : String(Number(x.toFixed(4))));

  function sourceTag(source) {
    const cls = { hw: 'hw', variant: 'variant', slide: 'slide', quiz: 'slide' }[source.kind] || '';
    const label = { hw: 'Homework', variant: 'Homework-style', slide: 'From slides', quiz: 'Slide quiz' }[source.kind] || 'Practice';
    return `<span class="tag ${cls}" title="${esc(source.note || '')}">${label}: ${esc(source.label)}</span>`;
  }
  const TYPE_LABEL = { mcq: 'Multiple choice', numeric: 'Calculation', written: 'Explain / derive' };

  /* ---------------- question cards ---------------- */
  // Options are shown in a random order (fixed for this page load) so the
  // position of the right answer gives nothing away. "All…/Neither…" stay last.
  const perms = new Map();
  function optionOrder(q) {
    if (!perms.has(q.id)) {
      const idx = shuffle(q.options.map((_, i) => i));
      const pinned = (i) => /^(<p>)?(all|neither|none|both|either)\b/i.test(q.options[i].trim());
      perms.set(q.id, [...idx.filter((i) => !pinned(i)), ...idx.filter(pinned)]);
    }
    return perms.get(q.id);
  }

  function questionCard(q, opts = {}) {
    const exam = opts.mode === 'exam';
    const st = progress[q.id] && progress[q.id].status;
    const lesson = lessonBySlug[q.lesson];
    const parts = [];
    parts.push(`<article class="q ${!exam && st === 'correct' ? 'correct' : ''} ${!exam && st === 'wrong' ? 'wrong' : ''}" id="q-${esc(q.id)}" data-id="${esc(q.id)}">`);
    parts.push('<div class="q-meta">');
    if (opts.index != null) parts.push(`<span class="q-num">Q${opts.index}</span>`);
    if (!exam) parts.push(sourceTag(q.source));
    parts.push(`<span class="tag type">${TYPE_LABEL[q.type]}</span>`);
    if (lesson && opts.showLesson) parts.push(`<span class="tag">L${lesson.num} · ${esc(lesson.short)}</span>`);
    if (!exam) parts.push(`<button class="bookmark" data-act="bookmark" aria-pressed="${bookmarks[q.id] ? 'true' : 'false'}" title="Bookmark for review" aria-label="Bookmark">★</button>`);
    parts.push('</div>');
    parts.push(`<div class="q-prompt">${q.prompt}</div>`);
    if (q.type === 'mcq') {
      parts.push('<div class="options" role="radiogroup">');
      optionOrder(q).forEach((i, pos) => {
        parts.push(`<label class="opt" data-orig="${i}"><input type="radio" name="opt-${esc(q.id)}" value="${i}"><span class="opt-letter">${LETTERS[pos]}</span><span>${q.options[i]}</span></label>`);
      });
      parts.push('</div>');
    } else if (q.type === 'numeric') {
      parts.push('<div class="fields">');
      q.fields.forEach((f, i) => {
        parts.push(`<label class="field"><span>${f.label}</span><input inputmode="decimal" autocomplete="off" data-field="${i}" aria-label="${esc(f.labelText || 'answer')}"><span class="expect"></span></label>`);
      });
      parts.push('</div>');
      if (!exam) parts.push('<p class="small muted">Decimals with . or , and fractions like -4/3 are accepted. Round to at least 2–3 decimals.</p>');
    }
    if (!exam) {
      parts.push('<div class="actions">');
      if (q.type !== 'written') parts.push('<button class="btn" data-act="check">Check</button>');
      parts.push(`<button class="btn ghost" data-act="solution">${q.type === 'written' ? 'Show model answer' : 'Show solution'}</button>`);
      parts.push('<span class="verdict" aria-live="polite"></span></div>');
    }
    parts.push(`<div class="solution" hidden><div class="solution-label">${q.type === 'written' ? 'Model answer' : 'Solution'}</div>${q.solution}`);
    if (q.type === 'written' && !exam) {
      parts.push('<div class="selfmark">How did you do? <button class="btn ghost" data-act="self-ok">I had it</button><button class="btn ghost" data-act="self-no">Review again</button></div>');
    }
    parts.push('</div></article>');
    return parts.join('');
  }

  // Grades one card in place. Returns true/false, or null if nothing was answered.
  function gradeCard(card, q, reveal) {
    let result = null;
    if (q.type === 'mcq') {
      const picked = $(`input[name="opt-${CSS.escape(q.id)}"]:checked`, card);
      $$('.opt', card).forEach((el) => {
        const i = Number(el.dataset.orig);
        el.classList.toggle('is-right', reveal && i === q.answer);
        el.classList.toggle('is-wrong', reveal && picked && Number(picked.value) === i && i !== q.answer);
      });
      if (picked) result = Number(picked.value) === q.answer;
    } else if (q.type === 'numeric') {
      let all = true; let any = false;
      $$('input[data-field]', card).forEach((inp) => {
        const f = q.fields[Number(inp.dataset.field)];
        const v = parseNumber(inp.value);
        const ok = !Number.isNaN(v) && closeEnough(v, f);
        if (inp.value.trim()) any = true;
        all = all && ok;
        inp.classList.toggle('ok', reveal && ok);
        inp.classList.toggle('no', reveal && !ok);
        const ex = inp.parentElement.querySelector('.expect');
        if (ex) ex.textContent = reveal && !ok ? `expected ≈ ${fmt(f.answer)}` : '';
      });
      if (any) result = all;
    }
    return result;
  }

  function wireCards(root, onChange) {
    root.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-act]');
      if (!btn) return;
      const card = btn.closest('.q');
      const q = byId[card.dataset.id];
      const act = btn.dataset.act;
      const verdict = $('.verdict', card);
      if (act === 'bookmark') {
        if (bookmarks[q.id]) delete bookmarks[q.id]; else bookmarks[q.id] = true;
        btn.setAttribute('aria-pressed', bookmarks[q.id] ? 'true' : 'false');
        saveBookmarks();
      } else if (act === 'check') {
        const r = gradeCard(card, q, true);
        if (r === null) { verdict.textContent = 'Answer first.'; verdict.className = 'verdict'; return; }
        verdict.textContent = r ? 'Correct ✓' : 'Not quite ✗ — open the solution to see the steps.';
        verdict.className = `verdict ${r ? 'ok' : 'no'}`;
        card.classList.toggle('correct', r); card.classList.toggle('wrong', !r);
        mark(q.id, r ? 'correct' : 'wrong');
        if (q.type === 'mcq') $('.solution', card).hidden = false;
        if (onChange) onChange();
      } else if (act === 'solution') {
        const sol = $('.solution', card);
        sol.hidden = !sol.hidden;
        btn.textContent = sol.hidden ? (q.type === 'written' ? 'Show model answer' : 'Show solution') : 'Hide';
        if (!progress[q.id]) { mark(q.id, 'seen'); if (onChange) onChange(); }
      } else if (act === 'self-ok' || act === 'self-no') {
        const ok = act === 'self-ok';
        mark(q.id, ok ? 'correct' : 'wrong');
        card.classList.toggle('correct', ok); card.classList.toggle('wrong', !ok);
        if (onChange) onChange();
      }
    });
  }

  /* ---------------- pages ---------------- */
  function lessonStats(slug) {
    const qs = questions.filter((q) => q.lesson === slug);
    const done = qs.filter((q) => progress[q.id] && progress[q.id].status === 'correct').length;
    return { total: qs.length, done, hw: qs.filter((q) => q.source.kind === 'hw' || q.source.kind === 'variant').length };
  }

  function pageHome() {
    const total = questions.length;
    const hw = questions.filter((q) => q.source.kind === 'hw').length;
    const variant = questions.filter((q) => q.source.kind === 'variant').length;
    const correct = questions.filter((q) => progress[q.id] && progress[q.id].status === 'correct').length;
    return `<div class="page">
      <section class="hero">
        <p class="eyebrow">INT3405 · Machine Learning · midterm prep</p>
        <h1>ML Studyroom</h1>
        <p class="lede">Every lecture from L1 to L8, explained in plain language. Each formula is taken apart symbol by symbol and then worked through with small numbers. The practice questions copy the style of the homework and slide quizzes.</p>
      </section>
      <div class="split">
        <a class="big-card" href="#/theory">
          <p class="eyebrow">Section 1</p><h2>Theory</h2>
          <ul><li>Start with the <b>Math toolkit</b> if Σ, ∂, matrices or log look scary.</li>
          <li>Each lesson: big picture → formulas → “how to read it” → step-by-step example.</li>
          <li>Printable <b>formula sheet</b> for the night before.</li></ul>
          <span class="go">Open theory →</span>
        </a>
        <a class="big-card practice" href="#/practice">
          <p class="eyebrow">Section 2</p><h2>Practice</h2>
          <ul><li>Every homework exercise, solved step by step, plus look-alike versions with new numbers.</li>
          <li>Multiple choice in the style of the 10 MCQs on the midterm.</li>
          <li>Unlimited <b>calculation drills</b> and a timed <b>mock midterm</b>.</li></ul>
          <span class="go">Start practising →</span>
        </a>
      </div>
      <div class="stats">
        <div class="stat"><b>${courseLessons.length}</b><span>lessons summarised</span></div>
        <div class="stat"><b>${total}</b><span>practice questions</span></div>
        <div class="stat"><b>${hw}</b><span>homework exercises</span></div>
        <div class="stat"><b>${variant}</b><span>homework-style variants</span></div>
        <div class="stat"><b>${GEN.list.length}</b><span>drill generators</span></div>
        <div class="stat"><b>${correct}</b><span>answered correctly (you)</span></div>
      </div>
      <h2>Lessons</h2>
      ${startCards()}
      ${lessonList()}
      <h2>About the midterm</h2>
      <p>Lecture 0 gives the midterm format as <b>10 multiple-choice questions + 2–3 practical questions</b>, worth 30% of the grade, in week 9. The mock midterm here follows that shape. The lessons cover L1–L8, including unsupervised learning, and the question bank includes the supplied homework through HW08. Both HW08 clustering exercises are worked in L8.</p>
    </div>`;
  }

  // One full-width row per lecture: number, title, summary, jump links to its
  // sections, and practice progress on the right.
  function lessonRow(l) {
    const s = lessonStats(l.slug);
    const pct = s.total ? Math.round((100 * s.done) / s.total) : 0;
    const topics = l.sections.filter((sec) => sec.id !== 'overview');
    return `<li class="lesson-row">
      <a class="lesson-num" href="#/theory/${l.slug}" tabindex="-1" aria-hidden="true">${l.num}</a>
      <div class="lesson-main">
        <h3><a href="#/theory/${l.slug}">${esc(l.title)}</a></h3>
        <p>${esc(l.summary)}</p>
        <nav class="lesson-topics" aria-label="Sections of lecture ${l.num}">${topics.map((sec) => `<a href="#/theory/${l.slug}/${sec.id}">${esc(sec.titleText)}</a>`).join('')}</nav>
      </div>
      <div class="lesson-side">
        <div class="lesson-progress" title="${s.done} of ${s.total} practice questions answered correctly"><span>${s.done}/${s.total} correct</span><div class="bar"><i style="width:${pct}%"></i></div></div>
        <a class="practice-link" href="#/practice/${l.slug}">Practice →</a>
      </div>
    </li>`;
  }

  function lessonList() {
    return `<ol class="lesson-list">${courseLessons.map(lessonRow).join('')}</ol>`;
  }

  // Math toolkit and formula sheet: the two pages that are not lectures.
  function startCards() {
    const card = (slug, kicker, blurb) => {
      const l = lessonBySlug[slug];
      return l ? `<a class="start-card" href="#/theory/${slug}"><span class="eyebrow">${kicker}</span><h3>${esc(l.title)}</h3><p>${esc(blurb)}</p><span class="go">Open →</span></a>` : '';
    };
    return `<div class="start-cards">
      ${card('math-toolkit', 'Start here', 'Notation, sums, logs, derivatives and matrices explained from zero, with small examples you can check on a calculator.')}
      ${card('formula-sheet', 'Night before', 'Key formulas from L2–L8 in one printable reference, each with a one-line reminder of what it means.')}
    </div>`;
  }

  function pageTheoryIndex() {
    return `<div class="page narrow-wide"><p class="eyebrow">Section 1</p><h1>Theory</h1>
      <p class="lede">One page per lecture. Every formula is read out symbol by symbol and then worked through with small numbers. If notation looks unfamiliar, start with the Math toolkit.</p>
      ${startCards()}
      <h2>Lectures</h2>
      ${lessonList()}</div>`;
  }

  function pageTheory(slug, sectionId) {
    const l = lessonBySlug[slug];
    if (!l) return notFound();
    const i = lectures.indexOf(l);
    const prev = lectures[i - 1]; const next = lectures[i + 1];
    const s = lessonStats(slug);
    const html = `<div class="page"><div class="theory-layout"><div>
      <p class="eyebrow">${l.num === 0 ? 'Start here' : l.num >= 99 ? 'Reference' : `Lecture ${l.num} · Theory`}</p>
      <h1>${esc(l.title)}</h1>
      <p class="lede">${esc(l.summary)}</p>
      ${l.sourceNote ? `<p class="small muted">${esc(l.sourceNote)}</p>` : ''}
      ${s.total ? `<p><a class="practice-link" href="#/practice/${slug}">✎ ${s.total} practice questions for this lesson</a></p>` : ''}
      <div class="theory-body">${l.sections.map((sec) => `<section class="theory-section" id="sec-${sec.id}"><h2>${sec.title}</h2>${sec.html}</section>`).join('')}</div>
      <nav class="pager">${prev ? `<a href="#/theory/${prev.slug}"><small>← Previous</small>${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a href="#/theory/${next.slug}" style="text-align:right"><small>Next →</small>${esc(next.title)}</a>` : ''}</nav>
      </div>
      <nav class="toc" aria-label="On this page"><b>On this page</b>${l.sections.map((sec) => `<a href="#/theory/${slug}/${sec.id}" data-sec="${sec.id}">${esc(sec.titleText || 'Overview')}</a>`).join('')}</nav>
    </div></div>`;
    return { html, after: () => {
      if (sectionId) { const el = document.getElementById(`sec-${sectionId}`); if (el) el.scrollIntoView(); }
      const links = $$('.toc a');
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', `sec-${a.dataset.sec}` === e.target.id));
          });
        }, { rootMargin: '0px 0px -70% 0px' });
        $$('.theory-section').forEach((el) => obs.observe(el));
      }
    } };
  }

  function pagePracticeIndex() {
    const lessonsWithQ = lectures.filter((l) => lessonStats(l.slug).total > 0);
    return `<div class="page"><p class="eyebrow">Section 2</p><h1>Practice</h1>
      <p class="lede">Questions are tagged by where they come from. <span class="tag hw">Homework</span> = the actual homework exercise, restated. <span class="tag variant">Homework-style</span> = same method, new numbers. <span class="tag slide">From slides</span> = built from a slide example, definition or in-class quiz.</p>
      <div class="grid">
        <a class="card" href="#/practice/all"><span class="num">EVERYTHING</span><h3>All ${questions.length} questions</h3><p>Filter by source, type and status.</p></a>
        <a class="card" href="#/drills"><span class="num">UNLIMITED</span><h3>Calculation drills</h3><p>Fresh numbers every time, with worked steps.</p></a>
        <a class="card" href="#/exam"><span class="num">TIMED</span><h3>Mock midterm</h3><p>10 multiple-choice + 3 calculation questions.</p></a>
        ${lessonsWithQ.map((l) => { const s = lessonStats(l.slug); const pct = Math.round((100 * s.done) / s.total);
          return `<a class="card" href="#/practice/${l.slug}"><span class="num">${l.num > 0 ? `LECTURE ${l.num}` : 'MATH'}</span><h3>${esc(l.title)}</h3><p>${s.total} questions · ${s.hw} homework / homework-style</p><div class="bar"><i style="width:${pct}%"></i></div></a>`; }).join('')}
      </div></div>`;
  }

  const filterState = { kind: 'all', type: 'all', status: 'all' };
  function pagePracticeList(slug) {
    const l = slug === 'all' ? null : lessonBySlug[slug];
    if (slug !== 'all' && !l) return notFound();
    const pool = questions.filter((q) => slug === 'all' || q.lesson === slug);
    const chip = (group, value, label) => `<button class="chip-btn" data-group="${group}" data-value="${value}" aria-pressed="${filterState[group] === value}">${label}</button>`;
    const html = `<div class="page narrow">
      <p class="eyebrow">${l ? (l.num > 0 ? `Lecture ${l.num} · Practice` : 'Practice') : 'Practice'}</p>
      <h1>${l ? esc(l.title) : 'All questions'}</h1>
      ${l ? `<p><a href="#/theory/${l.slug}">← Read the theory for this lesson</a></p>` : ''}
      <div class="toolbar" id="filters">
        ${chip('kind', 'all', 'All sources')}${chip('kind', 'hw', 'Homework')}${chip('kind', 'variant', 'Homework-style')}${chip('kind', 'slide', 'Slides')}
        <span class="spacer"></span>
        ${chip('type', 'all', 'All types')}${chip('type', 'mcq', 'MCQ')}${chip('type', 'numeric', 'Calculation')}${chip('type', 'written', 'Explain')}
        <span class="spacer"></span>
        ${chip('status', 'all', 'Any status')}${chip('status', 'todo', 'Not done')}${chip('status', 'wrong', 'Wrong')}
      </div>
      <p class="small muted" id="count"></p>
      <div id="qlist"></div></div>`;
    return { html, after: () => {
      const list = $('#qlist');
      const draw = () => {
        const shown = pool.filter((q) => {
          const kind = q.source.kind === 'quiz' ? 'slide' : q.source.kind;
          if (filterState.kind !== 'all' && kind !== filterState.kind) return false;
          if (filterState.type !== 'all' && q.type !== filterState.type) return false;
          const st = progress[q.id] && progress[q.id].status;
          if (filterState.status === 'todo' && (st === 'correct' || st === 'wrong')) return false;
          if (filterState.status === 'wrong' && st !== 'wrong') return false;
          return true;
        });
        $('#count').textContent = `${shown.length} of ${pool.length} questions shown`;
        list.innerHTML = shown.length ? shown.map((q, i) => questionCard(q, { index: i + 1, showLesson: slug === 'all' })).join('') : '<div class="empty">No questions match these filters.</div>';
      };
      $('#filters').addEventListener('click', (ev) => {
        const b = ev.target.closest('.chip-btn');
        if (!b) return;
        filterState[b.dataset.group] = b.dataset.value;
        $$(`.chip-btn[data-group="${b.dataset.group}"]`).forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        draw();
      });
      wireCards(list);
      draw();
    } };
  }

  function pageReview() {
    const ids = new Set([...Object.keys(progress).filter((id) => progress[id].status === 'wrong'), ...Object.keys(bookmarks)]);
    const pool = questions.filter((q) => ids.has(q.id));
    const html = `<div class="page narrow"><p class="eyebrow">Practice</p><h1>Review list</h1>
      <p class="lede">Questions you got wrong or bookmarked (★). Answer one correctly and it leaves the wrong list.</p>
      <div class="actions"><button class="btn ghost" id="reset-progress">Reset all progress…</button></div>
      <div id="qlist" style="margin-top:1rem">${pool.length ? pool.map((q, i) => questionCard(q, { index: i + 1, showLesson: true })).join('') : '<div class="empty">Nothing here yet. Wrong answers and bookmarked questions appear here.</div>'}</div></div>`;
    return { html, after: () => {
      wireCards($('#qlist'));
      $('#reset-progress').addEventListener('click', () => {
        if (!confirm('Clear all saved answers, bookmarks and exam history in this browser?')) return;
        progress = {}; bookmarks = {}; saveProgress(); saveBookmarks(); store.set('exams', []);
        route();
      });
    } };
  }

  /* ---------------- drills ---------------- */
  function pageDrillIndex() {
    const groups = {};
    GEN.list.forEach((g) => { (groups[g.lesson] = groups[g.lesson] || []).push(g); });
    return `<div class="page"><p class="eyebrow">Practice</p><h1>Calculation drills</h1>
      <p class="lede">Each drill makes a new problem with random numbers, checks your answer, and shows every step. Use them after the matching homework question makes sense.</p>
      ${Object.keys(groups).map((slug) => { const l = lessonBySlug[slug];
        return `<h2>${l ? `L${l.num} · ${esc(l.title)}` : esc(slug)}</h2><div class="grid">${groups[slug].map((g) => `<a class="card" href="#/drills/${g.id}"><h3>${esc(g.title)}</h3><p>${esc(g.blurb)}</p></a>`).join('')}</div>`; }).join('')}
    </div>`;
  }

  function pageDrill(id) {
    const g = GEN.list.find((x) => x.id === id);
    if (!g) return notFound();
    const html = `<div class="page narrow"><p class="eyebrow">Drill · L${lessonBySlug[g.lesson] ? lessonBySlug[g.lesson].num : ''}</p>
      <div class="drill-head"><h1 style="margin:0">${esc(g.title)}</h1><button class="btn ghost" id="again">New numbers ↻</button></div>
      <p class="muted">${esc(g.blurb)} <a href="#/theory/${g.lesson}">Theory</a></p><div id="drill"></div></div>`;
    return { html, after: () => {
      const box = $('#drill');
      const draw = () => {
        const p = g.make(Math.random);
        const card = document.createElement('article');
        card.className = 'q';
        card.innerHTML = `<div class="q-prompt">${tex(p.prompt)}</div>
          <div class="fields">${p.fields.map((f, i) => `<label class="field"><span>${tex(f.label)}</span><input inputmode="decimal" autocomplete="off" data-field="${i}"><span class="expect"></span></label>`).join('')}</div>
          <p class="small muted">Round to ${p.decimals || 3} decimals or better. Fractions like 2/3 are fine.</p>
          <div class="actions"><button class="btn" data-a="check">Check</button><button class="btn ghost" data-a="sol">Show solution</button><span class="verdict" aria-live="polite"></span></div>
          <div class="solution drill-steps" hidden><div class="solution-label">Solution</div>${tex(p.solution)}</div>`;
        box.replaceChildren(card);
        card.addEventListener('click', (ev) => {
          const b = ev.target.closest('[data-a]');
          if (!b) return;
          if (b.dataset.a === 'sol') { const s = $('.solution', card); s.hidden = !s.hidden; b.textContent = s.hidden ? 'Show solution' : 'Hide solution'; return; }
          let all = true; let any = false;
          $$('input[data-field]', card).forEach((inp) => {
            const f = p.fields[Number(inp.dataset.field)];
            const v = parseNumber(inp.value);
            if (inp.value.trim()) any = true;
            const ok = !Number.isNaN(v) && closeEnough(v, f);
            all = all && ok;
            inp.classList.toggle('ok', ok); inp.classList.toggle('no', !ok);
            inp.parentElement.querySelector('.expect').textContent = ok ? '' : `expected ≈ ${fmt(f.answer)}`;
          });
          const v = $('.verdict', card);
          if (!any) { v.textContent = 'Answer first.'; v.className = 'verdict'; return; }
          v.textContent = all ? 'Correct ✓' : 'Not quite ✗'; v.className = `verdict ${all ? 'ok' : 'no'}`;
          if (!all) $('.solution', card).hidden = false;
        });
      };
      $('#again').addEventListener('click', draw);
      draw();
    } };
  }

  /* ---------------- mock exam ---------------- */
  let exam = null; // { ids, endsAt, timerId, submitted }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function pageExam() {
    if (exam && !exam.submitted) return examRunning();
    const history = store.get('exams', []);
    const html = `<div class="page narrow"><p class="eyebrow">Practice</p><h1>Mock midterm</h1>
      <p class="lede">Same shape as the real midterm: multiple-choice questions plus practical calculation questions. Answers are checked only when you submit.</p>
      <div class="exam-setup">
        <label>Multiple-choice questions <select id="n-mcq"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label>
        <label>Calculation questions <select id="n-num"><option>2</option><option selected>3</option><option>4</option></select></label>
        <label>Time limit <select id="time"><option value="0">No timer</option><option value="30">30 min</option><option value="45">45 min</option><option value="60" selected>60 min</option><option value="90">90 min</option></select></label>
        <fieldset style="border:0;padding:0;margin:.6rem 0"><legend class="small muted">Lessons included</legend>
          ${courseLessons.map((l) => `<label style="display:inline-flex;margin-right:1rem"><input type="checkbox" class="lesson-pick" value="${l.slug}" checked> L${l.num}</label>`).join('')}
        </fieldset>
        <button class="btn" id="start">Start mock midterm</button>
        <p class="small muted">The official exam length was not stated in the slides; the timer is only for practice.</p>
      </div>
      ${history.length ? `<h2>Past attempts</h2><table class="history"><tr><th>Date</th><th>Score</th><th>Time used</th></tr>${history.slice(-10).reverse().map((h) => `<tr><td>${new Date(h.at).toLocaleString()}</td><td>${h.score}/${h.total}</td><td>${h.minutes} min</td></tr>`).join('')}</table>` : ''}
    </div>`;
    return { html, after: () => {
      $('#start').addEventListener('click', () => {
        const picks = $$('.lesson-pick:checked').map((x) => x.value);
        const nM = Number($('#n-mcq').value); const nN = Number($('#n-num').value);
        const mcq = shuffle(questions.filter((q) => q.type === 'mcq' && picks.includes(q.lesson) && !q.noExam)).slice(0, nM);
        const num = shuffle(questions.filter((q) => q.type === 'numeric' && picks.includes(q.lesson) && !q.noExam)).slice(0, nN);
        if (!mcq.length && !num.length) { alert('Pick at least one lesson.'); return; }
        const minutes = Number($('#time').value);
        exam = { ids: [...mcq, ...num].map((q) => q.id), startedAt: Date.now(), endsAt: minutes ? Date.now() + minutes * 60000 : 0, submitted: false };
        route();
      });
    } };
  }

  function examRunning() {
    const qs = exam.ids.map((id) => byId[id]);
    const html = `<div class="page narrow">
      <div class="timer" id="timer"><span>Mock midterm · ${qs.length} questions</span><span class="t" id="clock">${exam.endsAt ? '' : 'no timer'}</span></div>
      <form id="exam-form">${qs.map((q, i) => questionCard(q, { mode: 'exam', index: i + 1 })).join('')}
      <div class="actions"><button class="btn" type="submit">Submit answers</button><button class="btn ghost" type="button" id="quit">Abandon</button></div></form></div>`;
    return { html, after: () => {
      const form = $('#exam-form');
      const tick = () => {
        if (!exam || !exam.endsAt) return;
        const left = Math.max(0, exam.endsAt - Date.now());
        const m = Math.floor(left / 60000); const s = Math.floor((left % 60000) / 1000);
        const clock = $('#clock');
        if (clock) clock.textContent = `${m}:${String(s).padStart(2, '0')} left`;
        const t = $('#timer'); if (t) t.classList.toggle('low', left < 5 * 60000);
        if (left === 0) submitExam(form, qs);
      };
      clearInterval(exam.timerId);
      if (exam.endsAt) { exam.timerId = setInterval(tick, 1000); tick(); }
      form.addEventListener('submit', (ev) => { ev.preventDefault(); if (confirm('Submit and see your score?')) submitExam(form, qs); });
      $('#quit').addEventListener('click', () => { if (confirm('Abandon this attempt?')) { clearInterval(exam.timerId); exam = null; route(); } });
    } };
  }

  function submitExam(form, qs) {
    if (!exam || exam.submitted) return;
    clearInterval(exam.timerId);
    exam.submitted = true;
    let score = 0;
    qs.forEach((q) => {
      const card = form.querySelector(`[data-id="${CSS.escape(q.id)}"]`);
      const r = gradeCard(card, q, true);
      if (r) score++;
      mark(q.id, r ? 'correct' : 'wrong');
      card.classList.add(r ? 'correct' : 'wrong');
      $('.solution', card).hidden = false;
      $$('input', card).forEach((inp) => { inp.disabled = true; });
    });
    const minutes = Math.round((Date.now() - exam.startedAt) / 60000);
    const history = store.get('exams', []);
    history.push({ at: Date.now(), score, total: qs.length, minutes });
    store.set('exams', history.slice(-30));
    const timer = $('#timer'); if (timer) timer.remove();
    const btns = form.querySelector('.actions'); if (btns) btns.remove();
    const card = document.createElement('div');
    card.className = 'score-card';
    card.innerHTML = `<div class="big">${score} / ${qs.length}</div><p>${Math.round((100 * score) / qs.length)}% correct in ${minutes} min. Wrong answers were added to your <a href="#/review">review list</a>. Solutions are open below.</p><button class="btn" id="new-exam">New mock midterm</button>`;
    form.parentElement.prepend(card);
    $('#new-exam').addEventListener('click', () => { exam = null; route(); });
    window.scrollTo(0, 0);
  }

  function notFound() { return '<div class="page"><h1>Not found</h1><p><a href="#/">Go home</a></p></div>'; }

  /* ---------------- router ---------------- */
  function updateReviewCount() {
    const n = new Set([...Object.keys(progress).filter((id) => progress[id].status === 'wrong'), ...Object.keys(bookmarks)].filter((id) => byId[id])).size;
    const el = document.getElementById('review-count');
    if (el) el.textContent = n ? String(n) : '';
  }

  function route() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    let out;
    const [a, b, c] = parts;
    if (!a) out = pageHome();
    else if (a === 'theory' && !b) out = pageTheoryIndex();
    else if (a === 'theory') out = pageTheory(b, c);
    else if (a === 'practice' && !b) out = pagePracticeIndex();
    else if (a === 'practice') out = pagePracticeList(b);
    else if (a === 'drills' && !b) out = pageDrillIndex();
    else if (a === 'drills') out = pageDrill(b);
    else if (a === 'exam') out = pageExam();
    else if (a === 'review') out = pageReview();
    else out = notFound();
    if (exam && !exam.submitted && a !== 'exam') { /* keep exam state; timer keeps running */ }
    const page = typeof out === 'string' ? { html: out } : out;
    main.innerHTML = page.html;
    const key = a === 'theory' && (b === 'math-toolkit' || b === 'formula-sheet') ? `theory/${b}` : (a || 'home');
    $$('.sidebar nav a').forEach((el) => el.classList.toggle('active', el.dataset.nav === key));
    const title = $('h1', main);
    document.title = title && a ? `${title.textContent} · ML Studyroom` : 'ML Studyroom';
    if (!(a === 'theory' && c)) window.scrollTo(0, 0);
    if (page.after) page.after();
    closeMenu();
  }

  /* ---------------- mobile menu ---------------- */
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const menuBtn = document.getElementById('menu-btn');
  function closeMenu() { sidebar.classList.remove('open'); scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => {
    const open = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open); scrim.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open));
  });
  scrim.addEventListener('click', closeMenu);

  window.addEventListener('hashchange', route);
  updateReviewCount();
  route();
})();
