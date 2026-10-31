// The course: 7 units, 34 lessons.
import u1 from './u1.js';
import u2 from './u2.js';
import u3 from './u3.js';
import u4 from './u4.js';

export const UNITS = [
  { n: 1, title: 'Foundations', ar: 'الْأُسُس', tr: 'Temeller', blurb: 'Roots, the three kinds of words, definiteness, gender, number and case.' },
  { n: 2, title: 'Pronouns and pointing', ar: 'الضَّمَائِر', tr: 'Zamirler', blurb: 'I, you, he — as words and as endings; this, that; who and what.' },
  { n: 3, title: 'Building phrases', ar: 'التَّرَاكِيب', tr: 'Tamlamalar', blurb: 'The iḍāfa, adjectives and the nominal sentence.' },
  { n: 4, title: 'The verb', ar: 'الْفِعْل', tr: 'Fiil', blurb: 'Past, present, command; verb-first sentences; kāna and inna.' },
  { n: 5, title: 'Roots and patterns', ar: 'الصَّرْف', tr: 'Sarf', blurb: 'The ten verb forms, participles, maṣdars, weak verbs, the passive.' },
  { n: 6, title: 'Particles that steer meaning', ar: 'حُرُوفُ الْمَعَانِي', tr: 'Edatlar', blurb: 'Negation, questions, conditions and the small words in every verse.' },
  { n: 7, title: 'Reading the Quran', ar: 'قِرَاءَةُ الْقُرْآن', tr: 'Kıraat', blurb: 'Al-Fātiḥa, Āyat al-Kursī and the short surahs, word by word.' },
];

export const LESSONS = [...u1, ...u2, ...u3, ...u4].map((l, i) => ({ ...l, n: i + 1 }));

export function lessonById(id) { return LESSONS.find((l) => l.id === id) || null; }
