import { h, clear, esc, safeStorage } from '../util.js';
import { icon } from '../icons.js';
import { S, setSetting } from '../store.js';
import { topbar, env, takeTeacherContext } from '../ui.js';
import { instructions, verseContext, teacherTools } from '../teacher.js';
import { lessonById } from '../content/lessons.js';
import { surahMeta } from '../data.js';

const STORE_KEY = 'lisan.chat';
const ls = safeStorage();

function loadChat() { try { return JSON.parse(ls?.getItem(STORE_KEY) || '[]'); } catch { return []; } }
function saveChat(turns) { try { ls?.setItem(STORE_KEY, JSON.stringify(turns.slice(-24))); } catch { /* storage blocked */ } }

/** Minimal, safe Markdown → HTML (escape first, then format). Arabic runs read RTL. */
export function md(text) {
  const lines = esc(text).split('\n');
  const out = [];
  let list = null, table = null;
  const inline = (s) => s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/([؀-ۿ][؀-ۿݐ-ݿࢠ-ࣿ\sً-ٰٟـ،؟]*[؀-ۿً-ٰٟ])/g, '<span class="ar" lang="ar" dir="rtl">$1</span>');
  const flushList = () => { if (list) { out.push(`<${list.t}>${list.items.map((x) => `<li>${inline(x)}</li>`).join('')}</${list.t}>`); list = null; } };
  const flushTable = () => {
    if (!table) return;
    const rows = table.filter((r) => !/^\s*\|?\s*:?-{2,}/.test(r));
    const cells = rows.map((r) => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => inline(c.trim())));
    out.push(`<div class="table-wrap"><table>${cells.map((r, i) => `<tr>${r.map((c) => i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`);
    table = null;
  };
  for (const line of lines) {
    if (/^\s*\|.*\|\s*$/.test(line)) { flushList(); (table ||= []).push(line); continue; }
    flushTable();
    let m;
    if ((m = line.match(/^\s*[-*•]\s+(.*)/))) { if (!list || list.t !== 'ul') { flushList(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) { if (!list || list.t !== 'ol') { flushList(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    flushList();
    if ((m = line.match(/^#{1,4}\s+(.*)/))) { out.push(`<h4>${inline(m[1])}</h4>`); continue; }
    if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  flushList(); flushTable();
  return out.join('');
}

export async function render(root) {
  const view = h('div', { class: 'view' });
  root.appendChild(view);
  view.appendChild(topbar('Teacher', { sub: 'Hoca — answers with Claude' }));
  if (!env.teacher) {
    view.appendChild(h('div', { class: 'card stack' }, h('h2', {}, 'The teacher lives in the Claude app'),
      h('p', {}, 'Open Lisan from its claude.ai link to ask grammar and tafsir questions, get verses explained word by word, and practise in Türkçe or Deutsch. Everything else works here.')));
    return;
  }
  const turns = loadChat();
  const chat = h('div', { class: 'chat', 'aria-live': 'polite' });
  const langSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Answer language' });
  for (const [k, label] of [['en', 'English'], ['tr', 'Türkçe'], ['de', 'Deutsch']]) {
    langSeg.appendChild(h('button', { 'aria-pressed': String(S.settings.teacherLang === k), onclick: () => { setSetting('teacherLang', k); [...langSeg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(['en', 'tr', 'de'][i] === k))); } }, label));
  }
  const intro = h('div', { class: 'card stack' },
    h('p', {}, 'Ask anything about Quranic Arabic: a verse, a word, a grammar point, a lesson you found hard. The teacher sees your progress and answers in the language you choose.'),
    h('div', { class: 'row' }, h('span', { class: 'label' }, 'Answers in'), langSeg));
  const suggestions = h('div', { class: 'suggest' });
  const ideas = [
    'Explain the difference between إِنْ, إِنَّ, أَنْ and أَنَّ with examples from the Quran.',
    'Give me 5 short sentences to translate, using only words I probably know.',
    'Explain the grammar of 2:255 step by step.',
    'What is the root ر ح م and how many forms of it appear in the Quran?',
    'Quiz me on the verb forms II–X.',
  ];
  for (const q of ideas) suggestions.appendChild(h('button', { class: 'chip cobalt', type: 'button', onclick: () => send(q) }, q.length > 60 ? q.slice(0, 58) + '…' : q));
  const box = h('textarea', { id: 'teacher-input', placeholder: 'Ask your question… (Shift+Enter for a new line)', 'aria-label': 'Your question', rows: '2' });
  const sendBtn = h('button', { class: 'btn', html: icon('send'), 'aria-label': 'Send' });
  const stopBtn = h('button', { class: 'btn coral', html: icon('stop'), 'aria-label': 'Stop', hidden: true });
  const clearBtn = h('button', { class: 'btn ghost small', onclick: () => { turns.length = 0; saveChat(turns); paintChat(); } }, 'New conversation');
  view.append(intro, h('div', { class: 'row spread' }, h('span', { class: 'label' }, 'Try'), clearBtn), suggestions, chat, h('div', { class: 'composer' }, box, sendBtn, stopBtn));

  function bubble(t) {
    if (t.role === 'user') return h('div', { class: 'msg me', html: md(t.shown || t.content) });
    return h('div', { class: 'msg ai', html: md(t.content) });
  }
  function paintChat() { clear(chat); turns.forEach((t) => chat.appendChild(bubble(t))); }
  paintChat();

  let ctl = null;
  async function send(text, hiddenContext) {
    const q = String(text || '').trim();
    if (!q || ctl) return;
    box.value = '';
    const content = hiddenContext ? `${hiddenContext}\n\nQuestion: ${q}` : q;
    turns.push({ role: 'user', content, shown: q });
    chat.appendChild(bubble(turns[turns.length - 1]));
    const ai = h('div', { class: 'msg ai', html: '<span class="thinking"><i></i><i></i><i></i> Thinking…</span>' });
    chat.appendChild(ai);
    ai.scrollIntoView({ block: 'end', behavior: 'smooth' });
    ctl = new AbortController();
    sendBtn.hidden = true; stopBtn.hidden = false;
    const msgs = [{ role: 'user', content: instructions() }, ...turns.slice(-12).map((t) => ({ role: t.role, content: t.content }))];
    try {
      const tools = teacherTools();
      const opts = { signal: ctl.signal, cache: false, onText: ({ text: t }) => { ai.innerHTML = md(t); } };
      if (tools) { opts.tools = tools; delete opts.cache; }
      const { text: answer, truncated } = await env.teacher.sample(msgs, opts);
      ai.innerHTML = md(answer) + (truncated ? '<p class="small muted">(The answer was cut short — ask for the rest.)</p>' : '');
      turns.push({ role: 'assistant', content: answer });
      saveChat(turns);
      ai.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (e) {
      const code = e?.code;
      if (code === 'cancelled') { ai.innerHTML = e.text ? md(e.text) : '<p class="muted">Stopped.</p>'; if (e.text) { turns.push({ role: 'assistant', content: e.text }); saveChat(turns); } }
      else if (code === 'not_granted' || code === 'sampling_disabled' || code === 'capability_disabled') { ai.innerHTML = '<p>The teacher needs permission to use Claude. Allow it when asked, or check this artifact\'s permissions.</p>'; turns.pop(); }
      else if (code === 'rate_limited') { ai.innerHTML = (e.text ? md(e.text) : '') + '<p class="muted">You have reached a usage limit for now. Try again later.</p>'; turns.pop(); }
      else if (code === 'refused') { ai.innerHTML = '<p class="muted">The teacher could not answer that. Try asking it differently.</p>'; turns.pop(); }
      else { ai.innerHTML = (e?.text ? md(e.text) : '') + '<p class="muted">The connection dropped. Send your question again.</p>'; turns.pop(); }
      saveChat(turns);
    } finally {
      ctl = null;
      sendBtn.hidden = false; stopBtn.hidden = true;
    }
  }
  sendBtn.addEventListener('click', () => send(box.value));
  stopBtn.addEventListener('click', () => ctl?.abort());
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(box.value); } });

  // arriving from a verse, word or lesson
  const ctx = takeTeacherContext();
  if (ctx) {
    try {
      if (ctx.kind === 'verse') {
        const data = await verseContext(ctx.s, ctx.a);
        send(`Explain ${surahMeta(ctx.s).name} ${ctx.s}:${ctx.a} for me: meaning, word-by-word grammar (with iʿrāb of the key words), and anything a learner should notice.`, data);
      } else if (ctx.kind === 'word') {
        const data = await verseContext(ctx.s, ctx.a);
        send(`In ${ctx.s}:${ctx.a}, explain word number ${ctx.w}: its root, pattern, form, grammar here, other places it appears, and Turkish words from the same root.`, data);
      } else if (ctx.kind === 'lesson') {
        const l = lessonById(ctx.id);
        if (l) box.value = `I am on lesson ${l.n} "${l.title}". Can you explain `;
        box.focus();
      }
    } catch { /* verse could not load; the learner can still type */ }
  }
  return () => ctl?.abort();
}
