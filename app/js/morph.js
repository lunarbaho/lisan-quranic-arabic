// Turns Quranic Arabic Corpus tags into explanations a learner can read.
// Each term is given in English, then the Arabic grammar term and the Turkish
// (Ottoman-tradition) term that Turkish religious schools use.
import { D } from './data.js';

export const FORMS = {
  1: ['I', 'فَعَلَ'], 2: ['II', 'فَعَّلَ'], 3: ['III', 'فَاعَلَ'], 4: ['IV', 'أَفْعَلَ'], 5: ['V', 'تَفَعَّلَ'],
  6: ['VI', 'تَفَاعَلَ'], 7: ['VII', 'انْفَعَلَ'], 8: ['VIII', 'افْتَعَلَ'], 9: ['IX', 'افْعَلَّ'], 10: ['X', 'اسْتَفْعَلَ'],
  11: ['XI', 'افْعَالَّ'], 12: ['XII', 'افْعَوْعَلَ'],
};

const PERSON = {
  '1S': 'I', '1P': 'we', '2MS': 'you (m. sg.)', '2FS': 'you (f. sg.)', '2D': 'you two', '2MD': 'you two', '2FD': 'you two (f.)',
  '2MP': 'you (m. pl.)', '2FP': 'you (f. pl.)', '3MS': 'he / it', '3FS': 'she / it', '3D': 'they two', '3MD': 'they two (m.)',
  '3FD': 'they two (f.)', '3MP': 'they (m.)', '3FP': 'they (f.)',
};
const OBJ = {
  '1S': 'me', '1P': 'us', '2MS': 'you (m. sg.)', '2FS': 'you (f. sg.)', '2D': 'you two', '2MD': 'you two', '2FD': 'you two',
  '2MP': 'you (pl.)', '2FP': 'you (f. pl.)', '3MS': 'him / it', '3FS': 'her / it', '3D': 'them two', '3MD': 'them two',
  '3FD': 'them two', '3MP': 'them', '3FP': 'them (f.)',
};
const POSS = {
  '1S': 'my', '1P': 'our', '2MS': 'your (m. sg.)', '2FS': 'your (f. sg.)', '2D': 'your (two)', '2MD': 'your (two)', '2FD': 'your (two)',
  '2MP': 'your (pl.)', '2FP': 'your (f. pl.)', '3MS': 'his / its', '3FS': 'her / its', '3D': 'their (two)', '3MD': 'their (two)',
  '3FD': 'their (two)', '3MP': 'their', '3FP': 'their (f.)',
};

const PREFIX = {
  'و': ['and', 'وَاو العطف'], 'ف': ['so, then', 'فاء'], 'ب': ['with, by, in', 'باء الجر'], 'ل': ['for, to', 'لام'],
  'ك': ['like, as', 'كاف التشبيه'], 'ال': ['the', 'أداة التعريف'], 'س': ['will (future)', 'سين الاستقبال'],
  'أ': ['question: is…? / did…?', 'همزة الاستفهام'], 'ي': ['O! (calling)', 'حرف النداء'], 'ه': ['attention: hey', 'ها التنبيه'],
  'ت': ['by (oath)', 'تاء القسم'],
};

// fine part-of-speech tags → [English, Arabic term, Turkish term]
const POS = {
  N: ['Noun', 'اسم', 'isim'], PN: ['Proper noun', 'اسم علم', 'özel isim'], PRON: ['Pronoun', 'ضمير', 'zamir'],
  DEM: ['Demonstrative', 'اسم إشارة', 'ism-i işaret'], REL: ['Relative pronoun', 'اسم موصول', 'ism-i mevsul'],
  T: ['Time adverb', 'ظرف زمان', 'zarf-ı zaman'], LOC: ['Place adverb', 'ظرف مكان', 'zarf-ı mekân'],
  NV: ['Verb-like noun', 'اسم فعل', 'isim fiil'], IMPN: ['Imperative noun', 'اسم فعل أمر', 'emir ismi'],
  V: ['Verb', 'فعل', 'fiil'],
  P: ['Preposition', 'حرف جر', 'harf-i cer'], CONJ: ['Conjunction', 'حرف عطف', 'atıf harfi'],
  DET: ['Definite article', 'أداة التعريف', 'harf-i tarif'], NEG: ['Negation', 'حرف نفي', 'nefy harfi'],
  ACC: ['Particle of emphasis (inna family)', 'حرف مشبه بالفعل', 'harf-i müşebbehe'],
  SUB: ['Subordinating particle', 'حرف مصدري', 'masdar harfi'], INTG: ['Question word', 'استفهام', 'istifham'],
  COND: ['Condition', 'شرط', 'şart edatı'], EMPH: ['Emphasis "surely"', 'لام التوكيد', 'tekit lamı'],
  REM: ['Resumption "and/so"', 'حرف استئناف', 'isti\'naf harfi'], RES: ['Restriction "only"', 'حرف حصر', 'hasr edatı'],
  CERT: ['Certainty "indeed"', 'حرف تحقيق', 'tahkik harfi'], FUT: ['Future particle', 'حرف استقبال', 'istikbal harfi'],
  VOC: ['Calling "O"', 'حرف نداء', 'nida harfi'], PRP: ['Purpose "so that"', 'لام التعليل', 'ta\'lil lamı'],
  CIRC: ['Circumstance "while"', 'واو الحال', 'hâl vavı'], SUP: ['Extra (emphasis)', 'حرف زائد', 'zaid harf'],
  RSLT: ['Result "then"', 'جواب الشرط', 'cevap fası'], PRO: ['Prohibition "do not"', 'لا الناهية', 'nehy lâsı'],
  PREV: ['Preventive mā', 'ما الكافة', 'kâffe mâsı'], RET: ['Correction "rather"', 'حرف إضراب', 'idrab harfi'],
  EXP: ['Exception "except"', 'أداة استثناء', 'istisna edatı'], CAUS: ['Cause "because"', 'حرف سببية', 'sebep harfi'],
  EXL: ['Explanation "as for"', 'حرف تفصيل', 'tafsil harfi'], AMD: ['Correction "but"', 'حرف استدراك', 'istidrak harfi'],
  ANS: ['Answer', 'حرف جواب', 'cevap harfi'], INC: ['Beginning', 'حرف ابتداء', 'ibtida harfi'],
  INT: ['Interpretation "that is"', 'حرف تفسير', 'tefsir harfi'], EXH: ['Exhortation "why not"', 'حرف تحضيض', 'tahdid harfi'],
  SUR: ['Surprise "behold"', 'حرف فجاءة', 'müfacee harfi'], AVR: ['Rejection "No!"', 'حرف ردع', 'red\' harfi'],
  INL: ['Quranic initials', 'حروف مقطعة', 'hurûf-ı mukattaa'], EQ: ['Equalization "whether"', 'همزة التسوية', 'tesviye hemzesi'],
  COM: ['"together with"', 'واو المعية', 'maiyyet vavı'], ATT: ['Attention "hey"', 'حرف تنبيه', 'tenbih harfi'],
  DIST: ['Distance marker', 'لام البعد', 'bu\'d lamı'], ADDR: ['Addressee marker', 'كاف الخطاب', 'hitap kâfı'],
};

const CASE = { NOM: ['nominative', 'مرفوع', 'merfû'], ACC: ['accusative', 'منصوب', 'mansûb'], GEN: ['genitive', 'مجرور', 'mecrûr'] };
const MOOD = { IND: ['indicative', 'مرفوع', 'merfû'], SUBJ: ['subjunctive', 'منصوب', 'mansûb'], JUS: ['jussive', 'مجزوم', 'meczûm'] };
const ASPECT = { PERF: ['Past', 'ماضٍ', 'mâzi'], IMPF: ['Present', 'مضارع', 'muzâri'], IMPV: ['Command', 'أمر', 'emir'] };

export function parseFeat(idx) {
  const s = D.feats[idx] || 'N:';
  const cls = s[0];
  const tags = s.slice(2).split('|').filter(Boolean);
  const f = { cls, tags, pref: tags.includes('PREF'), suff: tags.includes('SUFF') };
  for (const t of tags) {
    if (/^[123][MF]?[SDP]$/.test(t)) f.pgn = t;
    else if (/^[MF]?[SDP]$/.test(t) || t === 'M' || t === 'F') f.gn = t;
    else if (t.startsWith('VF:')) f.form = +t.slice(3);
    else if (t.startsWith('MOOD:')) f.mood = t.slice(5);
    else if (t.startsWith('FAM:')) f.fam = t.slice(4);
    else if (CASE[t] && cls === 'N') f.case = t;
    else if (ASPECT[t]) f.aspect = t;
    else if (t === 'PASS') f.pass = true;
    else if (t === 'INDEF') f.indef = true;
    else if (t === 'ADJ') f.adj = true;
    else if (t === 'ACT_PCPL') f.act = true;
    else if (t === 'PASS_PCPL') f.passp = true;
    else if (t === 'VN') f.vn = true;
    else if (POS[t] && !f.pos) f.pos = t;
  }
  if (!f.pos) f.pos = cls === 'V' ? 'V' : cls === 'N' ? 'N' : 'P';
  return f;
}

function gnText(gn) {
  if (!gn) return '';
  const g = gn.includes('F') ? 'feminine' : gn.includes('M') ? 'masculine' : '';
  const n = gn.endsWith('D') ? 'dual' : gn.endsWith('P') ? 'plural' : gn.endsWith('S') ? 'singular' : '';
  return [g, n].filter(Boolean).join(' ');
}

/** Describe one segment in context: returns {role, title, terms[], detail[]}. */
export function describeSegment(seg, segs, i) {
  const [text, fi, lid] = seg;
  const f = parseFeat(fi);
  const lem = lid >= 0 && D.lemmas ? D.lemmas[lid] : null;
  const out = { role: f.pref ? 'pre' : f.suff ? 'suf' : 'stem', title: '', terms: [], detail: [], f };
  const pos = POS[f.pos] || POS.N;

  if (f.pos === 'PRON') {
    const p = f.pgn || '3MS';
    if (f.suff || i > 0) {
      const prev = segs[i - 1] ? parseFeat(segs[i - 1][1]) : null;
      if (prev && prev.cls === 'V') {
        out.title = prev.pgn === p && !segs.slice(0, i - 1).some((s) => parseFeat(s[1]).pos === 'PRON')
          ? `subject: ${PERSON[p] || p}` : `object: ${OBJ[p] || p}`;
      } else if (prev && prev.cls === 'P') out.title = `${OBJ[p] || p} (after a preposition)`;
      else out.title = `possessive: ${POSS[p] || p}`;
      out.terms = ['ضمير متصل', 'muttasıl zamir'];
    } else {
      out.title = `pronoun: ${PERSON[p] || p}`;
      out.terms = ['ضمير منفصل', 'munfasıl zamir'];
    }
    return out;
  }
  if (f.pref || (f.cls === 'P' && f.suff)) {
    const key = lem ? lem[0].replace(/[ً-ٰٟ]/g, '') : '';
    const pm = PREFIX[key];
    out.title = pm ? `“${pm[0]}”` : pos[0];
    out.terms = [pos[1], pos[2]];
    if (pos[0] && pm) out.detail.push(pos[0]);
    return out;
  }
  if (f.cls === 'V') {
    const asp = ASPECT[f.aspect] || ASPECT.PERF;
    out.title = `Verb · ${asp[0]}${f.pass ? ' passive' : ''}`;
    out.terms = [asp[1], asp[2]];
    if (f.form) out.detail.push(`Form ${FORMS[f.form][0]} (${FORMS[f.form][1]})`);
    if (f.pgn) out.detail.push(`subject: ${PERSON[f.pgn] || f.pgn}`);
    if (f.mood && f.aspect === 'IMPF') out.detail.push(`${MOOD[f.mood][0]} (${MOOD[f.mood][2]})`);
    if (f.pass) out.detail.push('passive (meçhul): the doer is not named');
    if (f.fam) out.detail.push(`a sister of ${f.fam}`);
    return out;
  }
  if (f.cls === 'N') {
    let kind = pos[0], ar = pos[1], tr = pos[2];
    if (f.act) { kind = 'Active participle (doer)'; ar = 'اسم فاعل'; tr = 'ism-i fâil'; }
    else if (f.passp) { kind = 'Passive participle (done-to)'; ar = 'اسم مفعول'; tr = 'ism-i mef\'ûl'; }
    else if (f.vn) { kind = 'Verbal noun'; ar = 'مصدر'; tr = 'masdar'; }
    else if (f.adj && f.pos === 'N') { kind = 'Adjective'; ar = 'صفة'; tr = 'sıfat'; }
    out.title = kind;
    out.terms = [ar, tr];
    if (f.form && (f.act || f.passp || f.vn)) out.detail.push(`from verb Form ${FORMS[f.form][0]}`);
    const gn = gnText(f.gn);
    if (gn) out.detail.push(gn);
    if (f.case) out.detail.push(`${CASE[f.case][0]} (${CASE[f.case][2]}, ${CASE[f.case][1]})`);
    if (f.indef) out.detail.push('indefinite (nekre)');
    return out;
  }
  out.title = pos[0];
  out.terms = [pos[1], pos[2]];
  if (f.fam) out.detail.push(`works like ${f.fam}`);
  return out;
}

/** One-line summary of a whole word. */
export function summarizeWord(word) {
  const segs = word[4];
  const stem = segs[word[3]] || segs[0];
  const d = describeSegment(stem, segs, word[3]);
  return [d.title, ...d.detail].join(' · ');
}

/** Short label for drills: "past · they (m.)" */
export function personLabel(pgn) { return PERSON[pgn] || pgn; }
export function aspectLabel(a) { return (ASPECT[a] || [a])[0]; }
