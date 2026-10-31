// Units 2–3 — Pronouns and pointing; building phrases
import { A, Q, table, tr, tip, key } from './kit.js';

export default [
  {
    id: 'pronouns', unit: 2, title: 'I, you, he: the pronouns', ar: 'الضَّمَائِرُ الْمُنْفَصِلَةُ', mins: 10,
    goal: 'Know all twelve standalone pronouns. They are among the most frequent words in the Quran.',
    words: [11, 62, 13, 394, 579, 74, 2100, 21, 4806, 944, 83, 68],
    steps: [
      { teach: `
        <h2>Twelve pronouns</h2>
        ${table(['', 'Singular', 'Dual', 'Plural'], [
          ['3rd (absent)', A('هُوَ') + ' he · ' + A('هِيَ') + ' she', A('هُمَا') + ' they two', A('هُمْ') + ' they (m.) · ' + A('هُنَّ') + ' they (f.)'],
          ['2nd (spoken to)', A('أَنْتَ') + ' you (m.) · ' + A('أَنْتِ') + ' you (f.)', A('أَنْتُمَا') + ' you two', A('أَنْتُمْ') + ' you (m.) · ' + A('أَنْتُنَّ') + ' you (f.)'],
          ['1st (speaking)', A('أَنَا') + ' I', '—', A('نَحْنُ') + ' we'],
        ])}
        ${tr('Turkish grammar calls them <i>munfasıl zamirler</i> (detached pronouns) — the Arabic ' + A('ضَمَائِر مُنْفَصِلَة') + '. The order is the Arabic one: <i>gâib</i> (absent), <i>muhatap</i> (addressed), <i>mütekellim</i> (speaker).')}` },
      { teach: `
        <h2>No word for "is"</h2>
        <p>A pronoun plus a noun is already a sentence: ${A('هُوَ اللّٰهُ')} "He is Allah"; ${A('أَنَا رَبُّكَ')} "I am your Lord"; ${A('نَحْنُ الْمُؤْمِنُونَ')} "we are the believers".</p>
        <p><b>The majestic "We".</b> Allah often speaks of Himself as ${A('نَحْنُ')} / ${A('ـنَا')} (${A('إِنَّا أَنْزَلْنَاهُ')} "We sent it down"). This is a plural of majesty, not of number — compare the official "biz" in Turkish.</p>
        ${Q('112:1')}` },
      { quiz: `${A('نَحْنُ')} means…`, o: ['we', 'they', 'you (pl.)', 'I'], a: 0, why: 'نَحْنُ = we.' },
      { quiz: '"you" (plural, masculine)', o: ['أَنْتُمْ', 'أَنْتَ', 'هُمْ', 'نَحْنُ'], a: 0, ar: true, why: 'أَنْتُمْ — the -um ending marks a masculine plural.' },
      { quiz: `In ${A('قُلْ هُوَ اللّٰهُ أَحَدٌ')}, ${A('هُوَ')} refers to…`, o: ['Allah — "He is Allah, One"', 'the Prophet', 'the people', 'the Quran'], a: 0, why: 'هُوَ is the subject; اللّٰهُ أَحَدٌ tells us who He is.' },
      { verse: '57:3', note: 'Four names of Allah joined by وَ, all after the pronoun هُوَ — a sentence without any verb.' },
      { words: true },
    ],
  },
  {
    id: 'attached', unit: 2, title: 'Attached pronouns: his, their, on them', ar: 'الضَّمَائِرُ الْمُتَّصِلَةُ', mins: 12,
    goal: 'Read the endings -hu, -hum, -ka, -kum, -nā, -ī on nouns, prepositions and verbs.',
    words: [434, 97, 102, 162, 177],
    steps: [
      { teach: `
        <h2>The same persons, as endings</h2>
        ${table(['Person', 'Ending', 'On a noun', 'On a preposition'], [
          ['he', A('ـهُ'), A('رَبُّهُ') + ' his Lord', A('لَهُ') + ' for him'],
          ['she', A('ـهَا'), A('رَبُّهَا') + ' her Lord', A('لَهَا') + ' for her'],
          ['they (m.)', A('ـهُمْ'), A('رَبُّهُمْ') + ' their Lord', A('لَهُمْ') + ' for them'],
          ['they two', A('ـهُمَا'), A('رَبُّهُمَا'), A('لَهُمَا')],
          ['they (f.)', A('ـهُنَّ'), A('رَبُّهُنَّ'), A('لَهُنَّ')],
          ['you (m.)', A('ـكَ'), A('رَبُّكَ') + ' your Lord', A('لَكَ') + ' for you'],
          ['you (f.)', A('ـكِ'), A('رَبُّكِ'), A('لَكِ')],
          ['you (pl.)', A('ـكُمْ'), A('رَبُّكُمْ'), A('لَكُمْ')],
          ['I', A('ـي') + ' / ' + A('ـنِي'), A('رَبِّي') + ' my Lord', A('لِي') + ' for me'],
          ['we', A('ـنَا'), A('رَبُّنَا') + ' our Lord', A('لَنَا') + ' for us'],
        ])}
        ${tr('These are the <i>muttasıl zamirler</i>. You say them daily: <i>es-selâmu aleykum</i> = ' + A('السَّلَامُ عَلَيْكُمْ') + ' "peace be on you (pl.)".')}` },
      { teach: `
        <h2>Three rules that explain everything</h2>
        <ol>
          <li><b>Vowel harmony:</b> after <i>i</i> or <i>y</i>, ${A('ـهُ ـهُمْ')} become ${A('ـهِ ـهِمْ')}: ${A('بِهِ · فِيهِ · عَلَيْهِمْ')}. (Turkish speakers know vowel harmony well.)</li>
          <li><b>Prepositions reshape:</b> ${A('عَلَى')} + ${A('هِمْ')} → ${A('عَلَيْهِمْ')}; ${A('إِلَى')} + ${A('كَ')} → ${A('إِلَيْكَ')}; ${A('مِنْ')} + ${A('هُ')} → ${A('مِنْهُ')}.</li>
          <li><b>On verbs</b> the ending is the object: ${A('خَلَقَكُمْ')} "He created you"; "me" is ${A('ـنِي')}: ${A('زِدْنِي')} "increase me".</li>
        </ol>
        <p>A noun with a possessive ending is definite and never takes ${A('الـ')}: ${A('رَبُّكَ')}, never ${A('الرَّبُّكَ')}.</p>
        <p>${A('إِيَّا')} carries an object ending when it is moved to the front for emphasis: ${Q('1:5', '1')} "You alone".</p>
        ${Q('20:114', '14-17')}` },
      { quiz: `${A('عَلَيْهِمْ')} means…`, o: ['on them', 'on him', 'from them', 'to you'], a: 0, why: 'عَلَى + هِمْ.' },
      { quiz: `${A('رَبُّنَا')} means…`, o: ['our Lord', 'my Lord', 'your Lord', 'their Lord'], a: 0, why: 'ـنَا = our.' },
      { quiz: '"for you" (plural)', o: ['لَكُمْ', 'لَكَ', 'لَهُمْ', 'لَنَا'], a: 0, ar: true, why: 'لِـ becomes لَـ before a pronoun; ـكُمْ = you (pl.).' },
      { quiz: `Split ${A('رَزَقْنَاهُمْ')} (2:3):`, o: ['رَزَقْ + نَا + هُمْ — We provided them', 'رَزَقَ + هُمْ — He provided them', 'رِزْق + نَا — our provision', 'رَزَقُوا + نَا — they provided us'], a: 0,
        why: 'The verb رَزَقَ with نَا (we, subject) and هُمْ (them, object).' },
      { verse: '2:3', note: 'Find the pronouns: the -ūna of the verbs (they), and ' + A('نَا') + ' + ' + A('هُمْ') + ' in ' + A('رَزَقْنَاهُمْ') + '.' },
      { words: true },
    ],
  },
  {
    id: 'pointing', unit: 2, title: 'This and that', ar: 'أَسْمَاءُ الْإِشَارَةِ', mins: 9,
    goal: 'Use the six demonstratives, and see the difference between "this book" and "this is a book".',
    words: [55, 247, 242, 22, 266, 57],
    steps: [
      { teach: `
        <h2>Near and far</h2>
        ${table(['', 'Near (this, these)', 'Far (that, those)'], [
          ['masculine', A('هٰذَا'), A('ذٰلِكَ')],
          ['feminine', A('هٰذِهِ'), A('تِلْكَ')],
          ['plural (people)', A('هٰؤُلَاءِ'), A('أُولٰئِكَ')],
        ])}
        <p>In the mushaf: ${A('أُو۟لَٰٓئِكَ')} — the و is written but not read: <i>ulāʾika</i>. Plurals of things use the feminine: ${A('تِلْكَ آيَاتُ')} "those are the verses".</p>
        ${tip('ذٰلِكَ "that" often lifts what it points at: ' + A('ذٰلِكَ الْكِتَابُ') + ' — "That (exalted) Book".')}` },
      { teach: `
        <h2>Phrase or sentence?</h2>
        ${table(['Arabic', 'Meaning', 'Why'], [
          [A('هٰذَا الْكِتَابُ'), 'this book', 'the next noun has الـ → one phrase'],
          [A('هٰذَا كِتَابٌ'), 'this is a book', 'no الـ → a full sentence'],
          [A('ذٰلِكَ الْفَوْزُ الْعَظِيمُ'), 'that is the great triumph', 'phrase used as a sentence'],
        ])}
        <p>${A('كَذٰلِكَ')} = ${A('كَـ')} + ${A('ذٰلِكَ')} "like that, thus" — over 100 times in the Quran.</p>
        ${Q('2:2')}
        ${Q('2:5')}` },
      { quiz: `${A('هٰذِهِ')} is…`, o: ['"this" (feminine)', '"that" (masculine)', '"these" (people)', '"those"'], a: 0, why: 'Near, feminine.' },
      { quiz: `${A('أُولٰئِكَ هُمُ الْمُفْلِحُونَ')} means…`, o: ['Those are the successful ones', 'These are the believers', 'They will succeed later', 'That success is great'], a: 0, why: 'أُولٰئِكَ "those" + هُمْ + الْمُفْلِحُونَ.' },
      { quiz: `${A('كَذٰلِكَ')} means…`, o: ['thus, likewise', 'that one', 'like this book', 'there'], a: 0, why: 'كَـ "like" + ذٰلِكَ "that".' },
      { words: true },
    ],
  },
  {
    id: 'relatives', unit: 2, title: 'Who, which, what', ar: 'الْأَسْمَاءُ الْمَوْصُولَةُ', mins: 9,
    goal: 'Read relative clauses with الَّذِي / الَّذِينَ, مَنْ and مَا.',
    words: [7, 9, 14],
    steps: [
      { teach: `
        <h2>Relative pronouns</h2>
        ${table(['Arabic', 'Use', 'Example'], [
          [A('الَّذِي'), 'who/which (m. sg.)', A('رَبَّكُمُ الَّذِي خَلَقَكُمْ') + ' your Lord who created you'],
          [A('الَّتِي'), 'who/which (f. sg.)', A('النَّارَ الَّتِي') + ' the Fire which…'],
          [A('الَّذِينَ'), 'those who (m. pl.)', A('الَّذِينَ آمَنُوا') + ' those who believe'],
          [A('مَنْ'), 'whoever, the one who (people)', A('مَنْ يَعْمَلْ') + ' whoever does'],
          [A('مَا'), 'what, that which (things)', A('مَا تَعْبُدُونَ') + ' what you worship'],
        ])}
        ${key(A('الَّذِينَ آمَنُوا') + ' "those who believe(d)" appears about 250 times. Make it instant.')}` },
      { teach: `
        <h2>Combinations</h2>
        <p>${A('مِنْ')} + ${A('مَا')} → ${A('مِمَّا')} "from what": ${Q('2:3', '6-8')} "and spend from what We provided them". ${A('عَنْ')} + ${A('مَا')} → ${A('عَمَّا')}; ${A('بِـ')} + ${A('مَا')} → ${A('بِمَا')} "for what": ${A('بِمَا كَانُوا يَعْمَلُونَ')} "for what they used to do".</p>
        ${tr('<i>Maşallah</i> is ' + A('مَا شَاءَ اللّٰهُ') + ' "what Allah willed (has come to be)" — ' + A('مَا') + ' as a relative pronoun.')}
        ${Q('96:1')}` },
      { quiz: `${A('الَّذِينَ آمَنُوا')} means…`, o: ['those who believe', 'who believes?', 'the believers will…', 'we believed'], a: 0, why: 'الَّذِينَ + past verb.' },
      { quiz: `${A('مِمَّا')} is…`, o: ['مِنْ + مَا', 'مِنْ + مَنْ', 'مَا + مَا', 'مَعَ + مَا'], a: 0, ar: true, why: 'The ن assimilates into the م.' },
      { quiz: '<i>Maşallah</i> literally means…', o: ['What Allah willed', 'If Allah wills', 'Praise be to Allah', 'Allah is great'], a: 0, why: 'مَا شَاءَ اللّٰهُ. ("If Allah wills" is inşallah: إِنْ شَاءَ اللّٰهُ.)' },
      { verse: '2:4', note: A('بِمَا أُنْزِلَ إِلَيْكَ') + ' "in what has been sent down to you".' },
      { words: true },
    ],
  },
  {
    id: 'idafa', unit: 3, title: '"Lord of the worlds": the iḍāfa', ar: 'الْإِضَافَةُ', mins: 11,
    goal: 'Build and read "X of Y" chains — the most common phrase type in the Quran.',
    words: [142, 66, 298, 140, 408, 76, 187, 556, 36, 93],
    steps: [
      { teach: `
        <h2>Two nouns, one idea</h2>
        <p><b>Iḍāfa</b> (Turkish <i>izâfet</i> — the <i>isim tamlaması</i>) joins two nouns: "the X of Y". ${A('رَبُّ الْعَالَمِينَ')} "the Lord of the worlds".</p>
        <ol>
          <li>The <b>first</b> noun (<i>muḍāf</i>) has <b>no</b> ${A('الـ')} and <b>no</b> tanwīn.</li>
          <li>The <b>second</b> noun (<i>muḍāf ilayh</i>) is always <b>genitive</b> (-i).</li>
          <li>The first noun keeps whatever case its own job needs.</li>
        </ol>
        ${tr('You already know dozens: <i>Resûlullah</i> ' + A('رَسُولُ اللّٰهِ') + ', <i>Beytullah</i> ' + A('بَيْتُ اللّٰهِ') + ', <i>Kelâmullah</i> ' + A('كَلَامُ اللّٰهِ') + ', <i>Ehl-i Kitâb</i> ' + A('أَهْلُ الْكِتَابِ') + ', <i>yevmü\'d-dîn</i> ' + A('يَوْمُ الدِّينِ') + '.')}` },
      { teach: `
        <h2>Chains and pronouns</h2>
        <p>Chains are common: ${Q('1:4')} — "Master of the Day of Judgment" (three nouns: ${A('مَالِكِ')} of ${A('يَوْمِ')} of ${A('الدِّينِ')}).</p>
        <p>A possessive ending is an iḍāfa too: ${A('رَبُّكَ')} "your Lord" = "the Lord of you".</p>
        ${table(['Frequent phrase', 'Meaning'], [
          [A('يَوْمُ الْقِيَامَةِ'), 'the Day of Resurrection'], [A('سَبِيلُ اللّٰهِ'), 'the way of Allah'],
          [A('أَصْحَابُ النَّارِ'), 'the people of the Fire'], [A('بَنُو إِسْرَائِيلَ'), 'the Children of Israel'],
          [A('آلُ فِرْعَوْنَ'), 'Pharaoh\'s people'], [A('ذُو الْفَضْلِ'), 'possessor of bounty'],
          [A('ابْنُ مَرْيَمَ'), 'the son of Maryam'],
        ])}
        <p>A sound plural or dual drops its ن in the first position: ${A('بَنُونَ')} → ${A('بَنُو إِسْرَائِيلَ')}.</p>` },
      { quiz: `${A('يَوْمِ الدِّينِ')} means…`, o: ['the Day of Judgment', 'a day of religion', 'the religious day', 'the day is religion'], a: 0, why: 'iḍāfa: "the day of the judgment".' },
      { quiz: '"the Messenger of Allah" is…', o: ['رَسُولُ اللّٰهِ', 'الرَّسُولُ اللّٰهِ', 'رَسُولٌ اللّٰهِ', 'رَسُولًا لِلّٰهِ'], a: 0, ar: true,
        why: 'The first noun has no ال and no tanwīn.' },
      { quiz: `Why does ${A('الْجَنَّةِ')} end in -i in ${A('أَصْحَابُ الْجَنَّةِ')}?`, o: ['It is the second noun of an iḍāfa', 'It follows a preposition', 'It is feminine', 'It is the subject'], a: 0, why: 'The muḍāf ilayh is always genitive.' },
      { verse: '1:4' },
      { words: true },
    ],
  },
  {
    id: 'adjectives', unit: 3, title: '"The straight path": adjectives', ar: 'النَّعْتُ', mins: 10,
    goal: 'Read noun–adjective pairs and tell a phrase from a sentence.',
    words: [108, 161, 103, 365, 285, 171, 188, 208, 416, 422, 478],
    steps: [
      { teach: `
        <h2>After the noun, in full agreement</h2>
        <p>An adjective (<i>naʿt</i>, Turkish <i>sıfat</i>) follows its noun and copies four things: <b>definiteness, gender, number, case</b>.</p>
        ${table(['Phrase', 'Meaning', 'Agreement'], [
          [A('الصِّرَاطَ الْمُسْتَقِيمَ'), 'the straight path', 'both الـ, both -a'],
          [A('عَذَابٌ أَلِيمٌ'), 'a painful punishment', 'both tanwīn -un'],
          [A('جَنَّاتٍ عَالِيَةٍ'), 'lofty gardens', 'thing-plural → feminine singular adjective'],
        ])}
        ${tr('Ottoman borrowed the order: <i>Kur\'ân-ı Kerîm</i> ' + A('الْقُرْآنُ الْكَرِيمُ') + ', <i>sırât-ı müstakîm</i>, <i>azîm</i> and <i>elîm</i> in sermons — noun first, adjective second.')}` },
      { teach: `
        <h2>Phrase or sentence?</h2>
        ${table(['Arabic', 'Meaning'], [
          [A('الْبَيْتُ الْكَبِيرُ'), 'the big house (phrase: both have الـ)'],
          [A('الْبَيْتُ كَبِيرٌ'), 'the house is big (sentence: adjective without الـ)'],
        ])}
        <p>This is why ${A('اللّٰهُ غَفُورٌ رَحِيمٌ')} is a sentence: "Allah is Forgiving, Merciful".</p>
        <p>Common Quranic pairs: ${A('أَجْرٌ عَظِيمٌ · أَجْرٌ كَرِيمٌ · رِزْقٌ كَرِيمٌ · ضَلَالٌ مُبِينٌ · عَدُوٌّ مُبِينٌ · عَذَابٌ شَدِيدٌ · الْفَوْزُ الْعَظِيمُ')}</p>
        ${Q('26:195')}
        <p>Two adjectives on one noun: "in a clear Arabic tongue".</p>` },
      { quiz: '"a great reward"', o: ['أَجْرٌ عَظِيمٌ', 'الْأَجْرُ عَظِيمٌ', 'أَجْرُ الْعَظِيمِ', 'عَظِيمٌ أَجْرٌ'], a: 0, ar: true, why: 'Indefinite noun + indefinite adjective.' },
      { quiz: `${A('الْبَيْتُ كَبِيرٌ')} means…`, o: ['The house is big.', 'the big house', 'a big house', 'the house of the great one'], a: 0, why: 'The adjective lacks الـ → it is the predicate.' },
      { quiz: `${A('عَدُوٌّ مُبِينٌ')}…`, o: ['a clear enemy', 'the enemy is clear', 'an enemy of clarity', 'clear enemies'], a: 0, why: 'Both indefinite: noun + adjective.' },
      { words: true },
    ],
  },
  {
    id: 'nominal', unit: 3, title: '"Allah is Forgiving": the nominal sentence', ar: 'الْجُمْلَةُ الْاِسْمِيَّةُ', mins: 11,
    goal: 'Read topic–comment sentences and the divine names that end so many verses.',
    words: [121, 104, 73, 116, 114, 248, 225, 254, 256, 203, 611, 561],
    steps: [
      { teach: `
        <h2>Mubtadaʾ and khabar</h2>
        <p>A sentence that starts with a noun is a <b>nominal sentence</b>. It has a topic (<i>mubtadaʾ</i>, Turkish <i>mübtedâ</i>) and a comment (<i>khabar</i>, Turkish <i>haber</i>). Both are nominative (-u), and there is no word for "is":</p>
        ${table(['Arabic', 'Topic', 'Comment', 'Meaning'], [
          [A('اللّٰهُ غَفُورٌ'), A('اللّٰهُ'), A('غَفُورٌ'), 'Allah is Forgiving'],
          [A('الْحَمْدُ لِلّٰهِ'), A('الْحَمْدُ'), A('لِلّٰهِ'), 'praise is (due) to Allah'],
          [A('هُوَ الْأَوَّلُ'), A('هُوَ'), A('الْأَوَّلُ'), 'He is the First'],
        ])}
        ${tr('Turkish does the same with the predicate: "Allah bağışlayandır". Turkish adds -dır; Arabic adds nothing.')}` },
      { teach: `
        <h2>The names that close the verses</h2>
        <p>Hundreds of verses end with two names of Allah as the comment. Learn them as pairs:</p>
        ${table(['Ending', 'Meaning'], [
          [A('غَفُورٌ رَحِيمٌ'), 'Forgiving, Merciful'], [A('عَلِيمٌ حَكِيمٌ'), 'Knowing, Wise'], [A('عَزِيزٌ حَكِيمٌ'), 'Mighty, Wise'],
          [A('سَمِيعٌ عَلِيمٌ'), 'Hearing, Knowing'], [A('سَمِيعٌ بَصِيرٌ'), 'Hearing, Seeing'], [A('عَلَى كُلِّ شَيْءٍ قَدِيرٌ'), 'over all things All-Powerful'],
        ])}
        <p>The patterns carry meaning: ${A('فَعِيل')} (${A('رَحِيم · عَلِيم · حَكِيم')}) a lasting quality; ${A('فَعُول')} (${A('غَفُور · شَكُور')}) doing it again and again; ${A('فَعْلَان')} (${A('رَحْمٰن')}) overflowing.</p>
        ${tr('Turkish names keep these patterns: Rahim, Alim, Hakim, Aziz, Kerim, Halim, Gafur.')}
        ${tip('With ' + A('إِنَّ') + ' the topic turns to -a and the comment stays -u: ' + A('إِنَّ اللّٰهَ غَفُورٌ رَحِيمٌ') + '.')}` },
      { quiz: `${A('وَاللّٰهُ عَلِيمٌ حَكِيمٌ')}…`, o: ['And Allah is Knowing, Wise.', 'And the knowing, wise Allah', 'And Allah knew wisely.', 'And Allah of knowledge and wisdom'], a: 0, why: 'Topic اللّٰهُ + comment عَلِيمٌ حَكِيمٌ.' },
      { quiz: `In ${A('الْحَمْدُ لِلّٰهِ')} the comment (khabar) is…`, o: ['لِلّٰهِ', 'الْحَمْدُ', 'There is none', 'The whole phrase'], a: 0, why: 'A prepositional phrase can be the comment.' },
      { quiz: 'Which pattern means "doing it intensely, again and again"?', o: ['فَعُول — غَفُور', 'فَعِيل — رَحِيم', 'فَاعِل — عَالِم', 'مَفْعُول — مَعْلُوم'], a: 0, why: 'غَفُور: one who forgives again and again.' },
      { verse: '42:11', note: 'From ' + A('لَيْسَ') + ' to the end: "There is nothing like Him, and He is the All-Hearing, the All-Seeing."' },
      { words: true },
    ],
  },
];
