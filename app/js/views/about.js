import { h } from '../util.js';
import { topbar } from '../ui.js';
import { D } from '../data.js';

export function render(root) {
  const view = h('div', { class: 'view' }, topbar('About Lisan', { sub: 'لِسَان — tongue, language' }));
  view.appendChild(h('div', { class: 'card stack', html: `
    <h2>The method</h2>
    <p>The Quran has 77,429 words, but a few hundred very frequent words make up most of it. Lisan teaches the ${D.vocab.length} most useful ones in frequency order, together with the grammar that connects them, and lets you read every verse with word-by-word help from day one.</p>
    <ul>
      <li><b>Frequency first</b>: every minute goes to the words you will meet most.</li>
      <li><b>Roots and patterns</b>: one root unlocks a family of words; ten verb forms explain thousands of shapes.</li>
      <li><b>Your languages</b>: meanings in English, Turkish and German, and the Turkish words that already come from each Arabic root.</li>
      <li><b>Spaced repetition</b>: reviews scheduled with FSRS-4.5, aiming at 90% recall.</li>
      <li><b>Real text</b>: every example, drill and reading comes straight from the Quran.</li>
    </ul>` }));
  view.appendChild(h('div', { class: 'card stack', html: `
    <h2>Sources</h2>
    <ul>
      <li>Morphology (roots, lemmas, grammar of every word): <a href="https://corpus.quran.com" target="_blank" rel="noopener">Quranic Arabic Corpus</a> v0.4 by Kais Dukes (GNU GPL), with the corrections of <a href="https://github.com/mustafa0x/quran-morphology" target="_blank" rel="noopener">mustafa0x/quran-morphology</a>.</li>
      <li>Uthmani text, word-by-word English and Turkish, recitation of single words: <a href="https://quran.com" target="_blank" rel="noopener">Quran.com</a> API.</li>
      <li>Translations: Saheeh International (English), Diyanet İşleri Başkanlığı (Türkçe), Frank Bubenheim &amp; Nadeem Elyas (Deutsch) — via Quran.com.</li>
      <li>Verse recitations: <a href="https://everyayah.com" target="_blank" rel="noopener">EveryAyah.com</a>.</li>
      <li>Fonts: Amiri Quran (Khaled Hosny), Scheherazade New (SIL), Alegreya (Huerta Tipográfica) — SIL Open Font License.</li>
      <li>Course, curated vocabulary, Turkish cognates and German glosses: written for Lisan.</li>
    </ul>
    <p class="small muted">Word-by-word glosses are aids for learning. For the meaning of a verse, rely on the full translations and on scholars.</p>` }));
  view.appendChild(h('p', { class: 'footer-note' }, h('span', { class: 'q-solo', lang: 'ar', dir: 'rtl' }, 'رَبِّ زِدْنِي عِلْمًا'),
    '"My Lord, increase me in knowledge." — 20:114'));
  root.appendChild(view);
}
