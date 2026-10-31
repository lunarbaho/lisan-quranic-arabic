// Authoring helpers for lesson content (trusted HTML written for this course).

/** Arabic written for the course (paradigms, examples) — not Quran quotes. */
export const A = (s) => `<span class="ar" lang="ar" dir="rtl">${s}</span>`;

/** Quran quote, filled from the data at runtime so the text is always exact.
 *  Q('1:2') → whole verse block; Q('1:2', '3-4') → words 3–4 inline. */
export const Q = (ref, w) => w
  ? `<span class="qref" data-ref="${ref}" data-w="${w}"></span>`
  : `<span class="qref" data-ref="${ref}"></span>`;

export const table = (head, rows, { ar = [] } = {}) => `<div class="table-wrap"><table><thead><tr>${head.map((x, i) => `<th${ar.includes(i) ? ' class="ar"' : ''}>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${ar.includes(i) ? ' class="ar" lang="ar" dir="rtl"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

/** Turkish connection callout (the learner's head start). */
export const tr = (html) => `<div class="callout tr"><span class="label">Türkçe bağlantı</span><p>${html}</p></div>`;
export const tip = (html, label = 'Tip') => `<div class="callout"><span class="label">${label}</span><p>${html}</p></div>`;
export const key = (html) => `<div class="callout gold"><span class="label">Remember</span><p>${html}</p></div>`;
export const ex = (ar, gloss) => `<div class="ex">${A(ar)}<span class="gl">${gloss}</span></div>`;
