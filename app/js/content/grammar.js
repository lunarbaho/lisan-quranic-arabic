// Grammar reference: compact tables to look things up while reading.
import { A, table, tr, tip } from './kit.js';

const P = ['he', 'she', 'they two (m.)', 'they two (f.)', 'they (m.)', 'they (f.)', 'you (m.)', 'you (f.)', 'you two', 'you (m. pl.)', 'you (f. pl.)', 'I', 'we'];
const PR = ['هُوَ', 'هِيَ', 'هُمَا', 'هُمَا', 'هُمْ', 'هُنَّ', 'أَنْتَ', 'أَنْتِ', 'أَنْتُمَا', 'أَنْتُمْ', 'أَنْتُنَّ', 'أَنَا', 'نَحْنُ'];
const PAST = ['فَعَلَ', 'فَعَلَتْ', 'فَعَلَا', 'فَعَلَتَا', 'فَعَلُوا', 'فَعَلْنَ', 'فَعَلْتَ', 'فَعَلْتِ', 'فَعَلْتُمَا', 'فَعَلْتُمْ', 'فَعَلْتُنَّ', 'فَعَلْتُ', 'فَعَلْنَا'];
const IND = ['يَفْعَلُ', 'تَفْعَلُ', 'يَفْعَلَانِ', 'تَفْعَلَانِ', 'يَفْعَلُونَ', 'يَفْعَلْنَ', 'تَفْعَلُ', 'تَفْعَلِينَ', 'تَفْعَلَانِ', 'تَفْعَلُونَ', 'تَفْعَلْنَ', 'أَفْعَلُ', 'نَفْعَلُ'];
const SUBJ = ['يَفْعَلَ', 'تَفْعَلَ', 'يَفْعَلَا', 'تَفْعَلَا', 'يَفْعَلُوا', 'يَفْعَلْنَ', 'تَفْعَلَ', 'تَفْعَلِي', 'تَفْعَلَا', 'تَفْعَلُوا', 'تَفْعَلْنَ', 'أَفْعَلَ', 'نَفْعَلَ'];
const JUS = ['يَفْعَلْ', 'تَفْعَلْ', 'يَفْعَلَا', 'تَفْعَلَا', 'يَفْعَلُوا', 'يَفْعَلْنَ', 'تَفْعَلْ', 'تَفْعَلِي', 'تَفْعَلَا', 'تَفْعَلُوا', 'تَفْعَلْنَ', 'أَفْعَلْ', 'نَفْعَلْ'];

export const GRAMMAR = [
  {
    id: 'pronouns', title: 'Pronouns', ar: 'الضَّمَائِر',
    html: table(['Person', 'Detached', 'Attached', 'Example'], [
      ['he', A('هُوَ'), A('ـهُ · ـهِ'), A('رَبُّهُ · بِهِ')], ['she', A('هِيَ'), A('ـهَا'), A('رَبُّهَا')],
      ['they two', A('هُمَا'), A('ـهُمَا'), A('رَبُّهُمَا')], ['they (m.)', A('هُمْ'), A('ـهُمْ · ـهِمْ'), A('رَبُّهُمْ · عَلَيْهِمْ')],
      ['they (f.)', A('هُنَّ'), A('ـهُنَّ'), A('رَبُّهُنَّ')], ['you (m.)', A('أَنْتَ'), A('ـكَ'), A('رَبُّكَ')],
      ['you (f.)', A('أَنْتِ'), A('ـكِ'), A('رَبُّكِ')], ['you two', A('أَنْتُمَا'), A('ـكُمَا'), A('رَبُّكُمَا')],
      ['you (m. pl.)', A('أَنْتُمْ'), A('ـكُمْ'), A('رَبُّكُمْ')], ['you (f. pl.)', A('أَنْتُنَّ'), A('ـكُنَّ'), A('رَبُّكُنَّ')],
      ['I', A('أَنَا'), A('ـي · ـنِي') + ' (on verbs)', A('رَبِّي · زِدْنِي')], ['we', A('نَحْنُ'), A('ـنَا'), A('رَبُّنَا')],
    ]) + tip('Object pronoun standing alone, for emphasis: ' + A('إِيَّاكَ') + ' · ' + A('إِيَّاهُ') + ' · ' + A('إِيَّايَ') + ' "you / him / me alone".'),
  },
  {
    id: 'past', title: 'Past tense', ar: 'الْمَاضِي',
    html: table(['Person', '', 'Past', 'with قَالَ'], P.map((p, i) => [p, A(PR[i]), A(PAST[i]),
      A(['قَالَ', 'قَالَتْ', 'قَالَا', 'قَالَتَا', 'قَالُوا', 'قُلْنَ', 'قُلْتَ', 'قُلْتِ', 'قُلْتُمَا', 'قُلْتُمْ', 'قُلْتُنَّ', 'قُلْتُ', 'قُلْنَا'][i])])),
  },
  {
    id: 'present', title: 'Present tense and its moods', ar: 'الْمُضَارِع',
    html: table(['Person', 'Indicative', 'Subjunctive', 'Jussive'], P.map((p, i) => [p, A(IND[i]), A(SUBJ[i]), A(JUS[i])])) +
      table(['Mood', 'When', 'Example'], [
        ['Indicative (merfû)', 'normal statements', A('يَعْلَمُونَ')],
        ['Subjunctive (mansûb)', 'after ' + A('أَنْ · لَنْ · كَيْ · لِـ · حَتَّى'), A('لَنْ تَرَانِي')],
        ['Jussive (meczûm)', 'after ' + A('لَمْ · لَمَّا · لَا') + ' (prohibition), ' + A('لِـ') + ' (let…), in conditions', A('لَمْ يَلِدْ')],
      ]),
  },
  {
    id: 'command', title: 'Command and prohibition', ar: 'الْأَمْرُ وَالنَّهْيُ',
    html: table(['To', 'Command', 'Prohibition'], [
      ['a man', A('اِفْعَلْ'), A('لَا تَفْعَلْ')], ['a woman', A('اِفْعَلِي'), A('لَا تَفْعَلِي')], ['two', A('اِفْعَلَا'), A('لَا تَفْعَلَا')],
      ['men / a group', A('اِفْعَلُوا'), A('لَا تَفْعَلُوا')], ['women', A('اِفْعَلْنَ'), A('لَا تَفْعَلْنَ')],
    ]) + tip('The helping vowel is ' + A('اُ') + ' when the present has u in the middle (' + A('يَكْتُبُ ← اُكْتُبْ') + '), otherwise ' + A('اِ') + '. Form IV commands start with ' + A('أَ') + ': ' + A('أَقِيمُوا') + '.'),
  },
  {
    id: 'forms', title: 'Verb forms I–X', ar: 'أَوْزَانُ الْفِعْل',
    html: table(['Form', 'Past', 'Present', 'Maṣdar', 'Doer', 'Done-to', 'Quran', 'Türkçe'], [
      ['I', A('فَعَلَ'), A('يَفْعَلُ'), 'varies', A('فَاعِل'), A('مَفْعُول'), A('عَلِمَ · خَلَقَ'), 'ilim, halk'],
      ['II', A('فَعَّلَ'), A('يُفَعِّلُ'), A('تَفْعِيل'), A('مُفَعِّل'), A('مُفَعَّل'), A('عَلَّمَ · نَزَّلَ'), 'talim, tenzil, muallim'],
      ['III', A('فَاعَلَ'), A('يُفَاعِلُ'), A('مُفَاعَلَة · فِعَال'), A('مُفَاعِل'), A('مُفَاعَل'), A('جَاهَدَ · قَاتَلَ'), 'mücahede, cihad, mücahit'],
      ['IV', A('أَفْعَلَ'), A('يُفْعِلُ'), A('إِفْعَال'), A('مُفْعِل'), A('مُفْعَل'), A('آمَنَ · أَنْزَلَ'), 'iman, İslam, mümin, Müslim'],
      ['V', A('تَفَعَّلَ'), A('يَتَفَعَّلُ'), A('تَفَعُّل'), A('مُتَفَعِّل'), A('مُتَفَعَّل'), A('تَوَكَّلَ · تَذَكَّرَ'), 'tevekkül, tefekkür'],
      ['VI', A('تَفَاعَلَ'), A('يَتَفَاعَلُ'), A('تَفَاعُل'), A('مُتَفَاعِل'), A('مُتَفَاعَل'), A('تَوَاصَى · تَعَاوَنَ'), 'teavün, tevazu'],
      ['VII', A('اِنْفَعَلَ'), A('يَنْفَعِلُ'), A('اِنْفِعَال'), A('مُنْفَعِل'), '—', A('اِنْقَلَبَ'), 'inkılap, infilak'],
      ['VIII', A('اِفْتَعَلَ'), A('يَفْتَعِلُ'), A('اِفْتِعَال'), A('مُفْتَعِل'), A('مُفْتَعَل'), A('اِخْتَلَفَ · اِتَّقَى'), 'ihtilaf, ittiba, muttaki'],
      ['IX', A('اِفْعَلَّ'), A('يَفْعَلُّ'), A('اِفْعِلَال'), A('مُفْعَلّ'), '—', A('اِسْوَدَّ') + ' (colors)', '—'],
      ['X', A('اِسْتَفْعَلَ'), A('يَسْتَفْعِلُ'), A('اِسْتِفْعَال'), A('مُسْتَفْعِل'), A('مُسْتَفْعَل'), A('اِسْتَغْفَرَ · اِسْتَقَامَ'), 'istiğfar, istikamet, müstakim'],
    ]) + tr('Read Turkish masdars as a form detector: <i>te-…-î</i> → II, <i>mü-…-a…e</i> → III, <i>i…â…</i> → IV, <i>te…ü…</i> → V/VI, <i>in…â…</i> → VII, <i>i…ti…â…</i> → VIII, <i>isti…â…</i> → X.'),
  },
  {
    id: 'weak', title: 'Weak verbs', ar: 'الْمُعْتَلّ',
    html: table(['', 'Past (he · they · I)', 'Present (he · they)', 'Jussive', 'Command'], [
      ['Hollow ' + A('ق و ل'), A('قَالَ · قَالُوا · قُلْتُ'), A('يَقُولُ · يَقُولُونَ'), A('يَقُلْ'), A('قُلْ · قُولُوا')],
      ['Hollow ' + A('ك و ن'), A('كَانَ · كَانُوا · كُنْتُ'), A('يَكُونُ · يَكُونُونَ'), A('يَكُنْ'), A('كُنْ · كُونُوا')],
      ['Hollow ' + A('ش ي ء'), A('شَاءَ · شَاءُوا · شِئْتُ'), A('يَشَاءُ · يَشَاءُونَ'), A('يَشَأْ'), '—'],
      ['Defective ' + A('د ع و'), A('دَعَا · دَعَوْا · دَعَوْتُ'), A('يَدْعُو · يَدْعُونَ'), A('يَدْعُ'), A('اُدْعُ · اُدْعُوا')],
      ['Defective ' + A('ه د ي'), A('هَدَى · هَدَوْا · هَدَيْتُ'), A('يَهْدِي · يَهْدُونَ'), A('يَهْدِ'), A('اِهْدِ')],
      ['Defective ' + A('ر أ ي'), A('رَأَى · رَأَوْا · رَأَيْتُ'), A('يَرَى · يَرَوْنَ'), A('يَرَ'), A('رَ')],
      ['Assimilated ' + A('و ج د'), A('وَجَدَ · وَجَدُوا · وَجَدْتُ'), A('يَجِدُ · يَجِدُونَ'), A('يَجِدْ'), '—'],
      ['Doubled ' + A('ض ل ل'), A('ضَلَّ · ضَلُّوا · ضَلَلْتُ'), A('يَضِلُّ · يَضِلُّونَ'), A('يَضِلَّ'), '—'],
    ]) + tip('Only two root letters visible? Look for a hidden و or ي — in the middle (hollow), at the end (defective) or at the start (assimilated).'),
  },
  {
    id: 'cases', title: 'Cases (iʿrāb)', ar: 'الْإِعْرَاب',
    html: table(['', 'Nominative · merfû', 'Accusative · mansûb', 'Genitive · mecrûr'], [
      ['singular', A('ـُ · ـٌ'), A('ـَ · ـً'), A('ـِ · ـٍ')],
      ['sound masc. plural', A('ـُونَ'), A('ـِينَ'), A('ـِينَ')],
      ['dual', A('ـَانِ'), A('ـَيْنِ'), A('ـَيْنِ')],
      ['sound fem. plural', A('ـَاتُ · ـَاتٌ'), A('ـَاتِ · ـَاتٍ'), A('ـَاتِ · ـَاتٍ')],
      ['the five nouns (أَب، أَخ، ذُو…)', A('أَبُو · ذُو'), A('أَبَا · ذَا'), A('أَبِي · ذِي')],
    ]) + table(['Case', 'Used for'], [
      ['Nominative', 'subject of a verb; topic and comment of a nominal sentence; topic of كَانَ; comment of إِنَّ'],
      ['Accusative', 'object; comment of كَانَ; topic of إِنَّ; adverbs of time and place; ḥāl (circumstance); after لَا of "there is no"'],
      ['Genitive', 'after a preposition; second noun of an iḍāfa'],
    ]),
  },
  {
    id: 'patterns', title: 'Noun patterns', ar: 'أَوْزَانُ الْأَسْمَاء',
    html: table(['Pattern', 'Meaning', 'Examples', 'Türkçe'], [
      [A('فَاعِل'), 'doer', A('عَالِم · كَافِر · صَابِر'), 'âlim, kâfir'],
      [A('مَفْعُول'), 'done-to', A('مَعْلُوم · مَغْضُوب · مَكْتُوب'), 'malum, mektup'],
      [A('فَعِيل'), 'lasting quality', A('رَحِيم · عَلِيم · كَبِير'), 'Rahim, Alim, kebir'],
      [A('فَعُول'), 'intense, repeated', A('غَفُور · شَكُور · رَسُول'), 'Gafur, resul'],
      [A('فَعَّال'), 'very much, habitually', A('تَوَّاب · غَفَّار · جَبَّار'), 'Tevvab, Gaffar'],
      [A('فَعْلَان'), 'full of', A('رَحْمٰن · غَضْبَان'), 'Rahman'],
      [A('أَفْعَل'), 'more, most', A('أَكْبَر · أَعْلَم · أَحْسَن'), 'ekber, a\'lem, ahsen'],
      [A('فُعْلَى'), 'most (feminine)', A('الْحُسْنَى · الدُّنْيَا · الْكُبْرَى'), 'Hüsna, dünya, kübra'],
      [A('مَفْعَل · مَفْعِل'), 'place, time', A('مَسْجِد · مَكَان · مَرْجِع'), 'mescit, mekân, merci'],
      [A('مِفْعَال'), 'instrument; intensive', A('مِيزَان · مِيثَاق · مِفْتَاح'), 'mizan, misak, miftah'],
    ]),
  },
  {
    id: 'particles', title: 'Particles at a glance', ar: 'الْحُرُوف',
    html: table(['Group', 'Particles'], [
      ['Prepositions (+ genitive)', A('مِنْ · إِلَى · عَنْ · عَلَى · فِي · بِـ · لِـ · كَـ · حَتَّى')],
      ['Place / time nouns', A('عِنْدَ · بَيْنَ · قَبْلَ · بَعْدَ · فَوْقَ · تَحْتَ · مَعَ · دُونَ · خَلْفَ · وَرَاءَ · حَوْلَ · لَدَى')],
      ['Joining', A('وَ · فَـ · ثُمَّ · أَوْ · أَمْ · بَلْ · لٰكِنْ')],
      ['Negation', A('لَا · مَا · لَمْ · لَنْ · لَيْسَ · إِنْ · غَيْر')],
      ['Questions', A('أَ · هَلْ · مَا · مَاذَا · مَنْ · أَيْنَ · كَيْفَ · مَتَى · أَنَّى · كَمْ · أَيّ · لِمَ')],
      ['Conditions', A('إِنْ · إِذَا · لَوْ · لَوْلَا · مَنْ · مَا · كُلَّمَا')],
      ['Inna and sisters (topic → -a)', A('إِنَّ · أَنَّ · لٰكِنَّ · كَأَنَّ · لَعَلَّ · لَيْتَ')],
      ['Kāna and sisters (comment → -a)', A('كَانَ · لَيْسَ · أَصْبَحَ · ظَلَّ · صَارَ · مَا زَالَ')],
      ['Emphasis, time', A('قَدْ · لَقَدْ · سَـ · سَوْفَ · إِنَّمَا · إِلَّا · أَلَا · كَلَّا · بَلَى')],
    ]),
  },
  {
    id: 'pointing', title: 'Demonstratives and relatives', ar: 'الْإِشَارَةُ وَالْمَوْصُول',
    html: table(['', 'Masculine', 'Feminine', 'Dual', 'Plural'], [
      ['this / these', A('هٰذَا'), A('هٰذِهِ'), A('هٰذَانِ · هٰذَيْنِ'), A('هٰؤُلَاءِ')],
      ['that / those', A('ذٰلِكَ'), A('تِلْكَ'), A('ذَانِكَ'), A('أُولٰئِكَ')],
      ['who, which', A('الَّذِي'), A('الَّتِي'), A('اللَّذَانِ · اللَّتَانِ'), A('الَّذِينَ · اللَّاتِي')],
    ]) + tip(A('مَنْ') + ' (people) and ' + A('مَا') + ' (things) are relatives too: "whoever", "what".'),
  },
  {
    id: 'numbers', title: 'Numbers', ar: 'الْأَعْدَاد',
    html: table(['', 'Arabic', '', 'Arabic'], [
      ['1', A('وَاحِد · أَحَد'), '6', A('سِتَّة')], ['2', A('اِثْنَانِ'), '7', A('سَبْعَة')], ['3', A('ثَلَاثَة'), '8', A('ثَمَانِيَة')],
      ['4', A('أَرْبَعَة'), '9', A('تِسْعَة')], ['5', A('خَمْسَة'), '10', A('عَشَرَة')], ['100', A('مِائَة'), '1000', A('أَلْف')],
    ]) + tip('Numbers 3–10 take the opposite gender of the counted noun: ' + A('سَبْعَ سَمٰوَاتٍ') + ' (feminine noun, number without ة), ' + A('ثَلَاثَةَ أَيَّامٍ') + ' (masculine noun, number with ة).'),
  },
];
