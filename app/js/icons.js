// Line icons drawn for Lisan (24×24, currentColor).
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
  path: '<path d="M5 20c0-4 3-5 7-5s7-1 7-5-3-5-7-5"/><circle cx="12" cy="5" r="1.6"/><circle cx="5" cy="20" r="1.6"/><circle cx="19" cy="10" r="1.6"/>',
  cards: '<rect x="3.5" y="6" width="13" height="15" rx="2"/><path d="M8 3h10.5A2 2 0 0 1 20.5 5v13"/><path d="M7.5 12h5M7.5 15.5h3"/>',
  quran: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5C7 18 10 18.5 12 20c2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z"/><path d="M12 6.5V20"/>',
  practice: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  roots: '<path d="M12 21V11"/><path d="M12 11c0-4-3-7-7-7 0 4 3 7 7 7Z"/><path d="M12 13c0-3.5 2.6-6 6.5-6 0 3.5-2.6 6-6.5 6Z"/><path d="M8 21h8"/>',
  grammar: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9h17M9.5 9v11"/>',
  teacher: '<path d="M4 5.5h16v10H9l-5 4v-14Z"/><path d="M8 9.5h8M8 12.5h5"/>',
  prefs: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>',
  words: '<path d="M4 19V6a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2"/><path d="M8 8.5h6M8 12h4"/>',
  play: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor"/>',
  pause: '<path d="M8 5.5v13M16 5.5v13"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.6 3.8-8.3.5 1.6 1.6 2.6 2.6 3 .2-2.8 1.5-5 3.6-6.5-.3 3.2 3 5.2 3 9.8 0 4.4-2.8 8.2-6.5 8.2Z"/>',
  sparkle: '<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9-5.7-1.8L10.2 9 12 3.5Z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5Z"/>',
  more: '<circle cx="5.5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/>',
  send: '<path d="M4 12 20 4l-4.5 16-3.5-6.5L4 12Z"/><path d="m12 13.5 8-9.5"/>',
  undo: '<path d="M8 8H15a5 5 0 0 1 0 10H9"/><path d="M11 4.5 7.5 8 11 11.5"/>',
};

export function icon(name, extra = '') {
  const body = P[name] || P.info;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
}

/** Eight-pointed star (two squares) — the rubʿ al-ḥizb mark of the mushaf. */
export function star8(fill = 'currentColor', stroke = 'none') {
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"><rect x="8" y="8" width="24" height="24" rx="2"/><rect x="8" y="8" width="24" height="24" rx="2" transform="rotate(45 20 20)"/></g></svg>`;
}

export function logo(size = 34) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><g stroke-linejoin="round"><rect x="7" y="7" width="26" height="26" rx="3" fill="var(--cobalt)"/><rect x="7" y="7" width="26" height="26" rx="3" fill="var(--turq)" transform="rotate(45 20 20)" opacity=".85"/><circle cx="20" cy="20" r="6.2" fill="var(--card)"/><circle cx="20" cy="20" r="2.4" fill="var(--coral)"/></g></svg>`;
}
