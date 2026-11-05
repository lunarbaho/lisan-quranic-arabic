// Units 4–5 — The verb; roots and patterns
import { A, Q, table, tr, tip, key } from './kit.js';

const past = (r) => table(['Person', 'Past', ''], [
  ['he', A(r[0]), 'did'], ['she', A(r[1]), 'did'], ['they (m.)', A(r[2]), 'did'], ['they (f.)', A(r[3]), ''],
  ['they two', A(r[4]), ''], ['you (m.)', A(r[5]), 'did'], ['you (f.)', A(r[6]), ''], ['you (pl.)', A(r[7]), 'did'],
  ['I', A(r[8]), 'did'], ['we', A(r[9]), 'did'],
]);

export default [
  {
    id: 'past', unit: 4, title: 'The past tense', ar: 'الْفِعْلُ الْمَاضِي', mins: 12,
    goal: 'Conjugate any verb in the past and spot the subject from the ending.',
    words: [63, 34, 30, 40, 44, 107, 150, 219, 332, 141, 199, 241, 126],
    steps: [
      { teach: `
        <h2>The base form of every verb</h2>
        <p>The past tense (<i>māḍī</i>, Turkish <i>mâzi</i>) is the dictionary form: ${A('فَعَلَ')} "he did". The ending tells you who did it — just like Turkish <i>yaptı, yaptılar, yaptın, yaptınız, yaptım, yaptık</i>.</p>
        ${past(['فَعَلَ', 'فَعَلَتْ', 'فَعَلُوا', 'فَعَلْنَ', 'فَعَلَا', 'فَعَلْتَ', 'فَعَلْتِ', 'فَعَلْتُمْ', 'فَعَلْتُ', 'فَعَلْنَا'])}
        ${key('Seven forms cover almost every past verb in the Quran: ' + A('فَعَلَ · فَعَلَتْ · فَعَلُوا · فَعَلْتَ · فَعَلْتُمْ · فَعَلْتُ · فَعَلْنَا') + '.')}` },
      { teach: `
        <h2>With real verbs</h2>
        ${table(['Arabic', 'Meaning'], [
          [A('خَلَقَ'), 'He created'], [A('خَلَقْنَا'), 'We created'], [A('كَفَرُوا'), 'they disbelieved'],
          [A('عَمِلُوا'), 'they did'], [A('قَالَتْ'), 'she said'], [A('ظَلَمْتُ نَفْسِي'), 'I wronged myself'],
        ])}
        <p>The alif in ${A('ـُوا')} is silent: ${A('كَفَرُوا')} is <i>kafarū</i>. The middle vowel belongs to each verb (${A('خَلَقَ · عَلِمَ · كَبُرَ')}) — learn it with the word.</p>
        ${Q('95:4')}` },
      { quiz: `${A('خَلَقْنَا')} means…`, o: ['We created', 'They created', 'I created', 'She created'], a: 0, why: '-nā = we.' },
      { quiz: '"they believed"', o: ['آمَنُوا', 'آمَنَ', 'آمَنْتُمْ', 'آمَنَّا'], a: 0, ar: true, why: '-ū (written ـُوا) = they.' },
      { quiz: `${A('قَالَتْ')} means…`, o: ['she said', 'you said', 'I said', 'they said'], a: 0, why: '-at = she.' },
      { quiz: `${A('عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ')} — who taught?`, o: ['He (Allah)', 'man', 'they', 'I'], a: 0, why: 'عَلَّمَ has no ending: "he". The object is الْإِنْسَانَ.' },
      { verse: '96:1' }, { verse: '96:2' }, { verse: '96:3' }, { verse: '96:4' }, { verse: '96:5', note: 'The first revelation: two past verbs, each used twice — ' + A('خَلَقَ') + ' and ' + A('عَلَّمَ') + '. (' + A('لَمْ يَعْلَمْ') + ' "he did not know" also speaks of the past — Lesson 27.)' },
      { words: true },
    ],
  },
  {
    id: 'present', unit: 4, title: 'The present tense', ar: 'الْفِعْلُ الْمُضَارِعُ', mins: 12,
    goal: 'Read present verbs from their prefix and ending — including the verse endings -ūn.',
    words: [101, 118, 109, 110, 127, 144, 240, 512, 603, 4805, 274],
    steps: [
      { teach: `
        <h2>Prefix + stem (+ ending)</h2>
        <p>The present tense (<i>muḍāriʿ</i>, Turkish <i>muzâri</i>) adds a prefix: ${A('أَـ')} I, ${A('نَـ')} we, ${A('يَـ')} he/they, ${A('تَـ')} you/she.</p>
        ${table(['Person', 'Present', 'Person', 'Present'], [
          ['he', A('يَفْعَلُ'), 'you (m.)', A('تَفْعَلُ')],
          ['she', A('تَفْعَلُ'), 'you (f.)', A('تَفْعَلِينَ')],
          ['they (m.)', A('يَفْعَلُونَ'), 'you (pl.)', A('تَفْعَلُونَ')],
          ['they (f.)', A('يَفْعَلْنَ'), 'you two / they two', A('تَفْعَلَانِ · يَفْعَلَانِ')],
          ['I', A('أَفْعَلُ'), 'we', A('نَفْعَلُ')],
        ])}
        ${tip('Memory aid: the four prefixes spell ' + A('أَنَيْتُ') + ' — <i>a-n-y-t</i>.')}` },
      { teach: `
        <h2>What it means and how it ends verses</h2>
        <p>The present covers now, habit and future (Turkish <i>geniş zaman</i>): ${A('يَعْلَمُ')} "he knows / will know". Add ${A('سَـ')} or ${A('سَوْفَ')} for a clear future: ${A('سَيَعْلَمُونَ')} "they will know".</p>
        <p>Many verses end in ${A('ـُونَ')}: ${A('يَعْلَمُونَ · يَعْقِلُونَ · تَعْمَلُونَ · تَشْكُرُونَ')}. Read the first letter: ${A('يَـ')} = they, ${A('تَـ')} = you all.</p>
        <p>Form I verbs take ${A('يَـ')}; several derived forms take ${A('يُـ')}: ${A('يُؤْمِنُونَ')} — that is Lesson 22.</p>
        ${Q('1:5')}` },
      { quiz: `${A('نَعْبُدُ')} means…`, o: ['we worship', 'they worship', 'I worship', 'you worship'], a: 0, why: 'نَـ = we.' },
      { quiz: `${A('تَعْقِلُونَ')} means…`, o: ['you (all) understand', 'they understand', 'she understands', 'we understand'], a: 0, why: 'تَـ … ـُونَ = you (pl.).' },
      { quiz: '"they know"', o: ['يَعْلَمُونَ', 'تَعْلَمُونَ', 'نَعْلَمُ', 'أَعْلَمُ'], a: 0, ar: true, why: 'يَـ … ـُونَ = they.' },
      { quiz: `${A('لَا أَعْبُدُ مَا تَعْبُدُونَ')} (109:2)`, o: ['I do not worship what you worship.', 'We do not worship what they worship.', 'Do not worship what you worship!', 'He does not worship what I worship.'], a: 0,
        why: 'أَعْبُدُ (I) and تَعْبُدُونَ (you, pl.).' },
      { verse: '109:1' }, { verse: '109:2' }, { verse: '109:3' }, { verse: '109:4' }, { verse: '109:5' }, { verse: '109:6', note: 'Apart from the command ' + A('قُلْ') + ' and the past ' + A('عَبَدْتُمْ') + ', every verb in the surah is present tense. ' + A('عَابِدٌ') + ' and ' + A('عَابِدُونَ') + ' are participles (Lesson 23).' },
      { words: true },
    ],
  },
  {
    id: 'commands', unit: 4, title: 'Commands and "do not"', ar: 'الْأَمْرُ وَالنَّهْيُ', mins: 10,
    goal: 'Recognize commands and prohibitions — and the duas that use them.',
    words: [146, 163, 216, 45, 71, 133, 289, 277, 354],
    steps: [
      { teach: `
        <h2>From the present to the command</h2>
        <p>Take the "you" present, drop the prefix, end the word with sukūn, and add a helping ${A('اُ')} or ${A('اِ')} if it now starts with two consonants:</p>
        ${table(['Present', 'Command', 'Meaning'], [
          [A('تَقْرَأُ'), A('اِقْرَأْ'), 'read! (96:1)'], [A('تَعْبُدُونَ'), A('اُعْبُدُوا'), 'worship! (pl.)'],
          [A('تَذْكُرُ'), A('اُذْكُرْ'), 'remember!'], [A('تَقُولُ'), A('قُلْ'), 'say! (over 300 times)'], [A('تَأْكُلُونَ'), A('كُلُوا'), 'eat! (pl.)'],
        ])}
        <p>Endings: ${A('اِفْعَلْ')} (to a man), ${A('اِفْعَلِي')} (to a woman), ${A('اِفْعَلُوا')} (to a group). Form IV commands begin with ${A('أَ')}: ${A('أَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ')}.</p>
        ${tr('Turkish grammar calls it <i>emir</i>; a prohibition is <i>nehiy</i> (' + A('نَهْي') + ').')}` },
      { teach: `
        <h2>"Do not…"</h2>
        <p>${A('لَا')} + the present with sukūn: ${A('لَا تَفْعَلْ')} "do not do"; ${A('لَا تَقْرَبُوا')} "do not approach"; ${A('لَا تَعْجَلْ')} "do not hasten".</p>
        <p>Commands addressed to Allah are <b>duas</b>: ${A('اهْدِنَا')} "guide us", ${A('رَبِّ زِدْنِي عِلْمًا')} "My Lord, increase me in knowledge".</p>
        ${Q('20:114', '14-17')}
        ${Q('2:43')}` },
      { quiz: `${A('اُعْبُدُوا')} means…`, o: ['worship! (pl.)', 'they worshipped', 'we worship', 'do not worship'], a: 0, why: 'Command, plural ending ـُوا.' },
      { quiz: `${A('لَا تَعْجَلْ')} means…`, o: ['Do not hasten.', 'He did not hasten.', 'You will not hasten.', 'There is no haste.'], a: 0, why: 'لَا + jussive = prohibition.' },
      { quiz: 'Which word is a command?', o: ['قُلْ', 'قَالَ', 'يَقُولُ', 'قَوْلٌ'], a: 0, ar: true, why: 'قُلْ "Say!"' },
      { verse: '2:153', note: A('اسْتَعِينُوا') + ' "seek help!" — a Form X command (Lesson 22).' },
      { words: true },
    ],
  },
  {
    id: 'verbal', unit: 4, title: 'Verb first: the verbal sentence', ar: 'الْجُمْلَةُ الْفِعْلِيَّةُ', mins: 10,
    goal: 'Find the doer and the object in verb-first sentences.',
    words: [43, 46, 99, 48, 54, 94, 64],
    steps: [
      { teach: `
        <h2>Verb → subject → object</h2>
        <p>Most Quranic sentences start with the verb. Then come the doer (<i>fāʿil</i>, Turkish <i>fâil</i>, -u) and the object (<i>mafʿūl bih</i>, Turkish <i>mef'ûlün bih</i>, -a).</p>
        ${table(['Verb', 'Subject (-u)', 'Object (-a)', 'Meaning'], [
          [A('خَلَقَ'), A('اللّٰهُ'), A('السَّمٰوَاتِ'), 'Allah created the heavens'],
          [A('جَاءَ'), A('نَصْرُ اللّٰهِ'), '—', 'the help of Allah came'],
        ])}
        ${tr('Turkish: <i>özne – nesne – yüklem</i>. Arabic often starts with the <i>yüklem</i>: "Yarattı Allah gökleri".')}
        ${Q('110:1')}` },
      { teach: `
        <h2>Two rules</h2>
        <ol>
          <li>When the subject is a noun <b>after</b> the verb, the verb stays <b>singular</b>, even for a plural subject: ${A('قَالَ الْحَوَارِيُّونَ')} "the disciples said" (3:52). When the subject is only a pronoun, it is part of the verb: ${A('قَالُوا')} "they said".</li>
          <li>Object pronouns attach to the verb: ${A('خَلَقَكُمْ')} "He created you"; ${Q('97:1', '2')} "We sent it down".</li>
        </ol>
        ${key('Word order can change for emphasis; the case endings keep the roles clear.')}` },
      { quiz: `In ${A('خَلَقَ اللّٰهُ السَّمٰوَاتِ')}, the subject is…`, o: ['اللّٰهُ', 'خَلَقَ', 'السَّمٰوَاتِ', 'There is none'], a: 0, ar: true, why: 'It ends in -u and does the action.' },
      { quiz: `${A('أَنْزَلْنَاهُ')} means…`, o: ['We sent it down', 'He sent us down', 'They sent him down', 'We were sent down'], a: 0, why: 'أَنْزَلْ + نَا (we) + هُ (it).' },
      { quiz: `Why ${A('قَالَ')} (singular) in ${A('قَالَ الْحَوَارِيُّونَ')}?`, o: ['A verb before its noun subject stays singular', 'الْحَوَارِيُّونَ is one person', 'It is a mistake', 'قَالَ is a noun here'], a: 0, why: 'Verb-first sentences use a singular verb, even for the plural الْحَوَارِيُّونَ. Without a noun after it, it would be قَالُوا.' },
      { verse: '110:1' }, { verse: '110:2' }, { verse: '110:3' },
      { words: true },
    ],
  },
  {
    id: 'kana', unit: 4, title: 'Kāna and her sisters', ar: 'كَانَ وَأَخَوَاتُهَا', mins: 10,
    goal: 'Read كَانَ, لَيْسَ and their sisters, and the very common "they used to do".',
    words: [122, 389, 444, 369],
    steps: [
      { teach: `
        <h2>"Was" changes the comment to -a</h2>
        <p>${A('كَانَ')} goes in front of a nominal sentence. The topic stays -u; the comment becomes -a:</p>
        ${table(['Without', 'With كَانَ'], [[A('اللّٰهُ غَفُورٌ'), A('كَانَ اللّٰهُ غَفُورًا')]])}
        <p>About Allah, ${A('كَانَ')} means "is ever, has always been" — not "was once".</p>
        ${Q('4:17', '17-20')}
        <p>Forms: present ${A('يَكُونُ')}; after ${A('لَمْ')}: ${A('يَكُنْ')} (${Q('112:4', '1-2')}); command ${A('كُنْ')}: ${A('كُنْ فَيَكُونُ')} "Be, and it is".</p>` },
      { teach: `
        <h2>The sisters, and "used to"</h2>
        ${table(['Verb', 'Meaning'], [
          [A('لَيْسَ'), 'is not'], [A('أَصْبَحَ'), 'became (lit. in the morning)'], [A('ظَلَّ'), 'remained, kept on'],
          [A('مَا زَالَ'), 'still, kept on'], [A('صَارَ'), 'became'],
        ])}
        <p>${A('كَانَ')} + a present verb = <b>used to, was doing</b>: ${A('بِمَا كَانُوا يَعْمَلُونَ')} "for what they used to do" — a very common verse ending.</p>
        ${Q('42:11', '14-16')}` },
      { quiz: `${A('كَانُوا يَكْسِبُونَ')}…`, o: ['they used to earn', 'they will earn', 'they earned it', 'they are earning now'], a: 0, why: 'كَانَ + present = habit in the past.' },
      { quiz: `${A('لَيْسَ كَمِثْلِهِ شَيْءٌ')}`, o: ['There is nothing like Him.', 'He is not like anything.', 'Nothing was with Him.', 'Is there anything like Him?'], a: 0, why: 'لَيْسَ "is not" + كَـ "like" + مِثْلِهِ + شَيْءٌ.' },
      { quiz: `Why ${A('غَفُورًا')} (-an) in ${A('كَانَ اللّٰهُ غَفُورًا')}?`, o: ['The comment of كَانَ takes -a', 'It is an object', 'It follows a preposition', 'It is feminine'], a: 0, why: 'كَانَ makes its comment manṣūb.' },
      { verse: '2:117', note: A('كُنْ فَيَكُونُ') + ' — the command and the present of كَانَ side by side.' },
      { words: true },
    ],
  },
  {
    id: 'inna', unit: 4, title: 'Inna and her sisters', ar: 'إِنَّ وَأَخَوَاتُهَا', mins: 10,
    goal: 'Read إِنَّ and its sisters — and never confuse إِنَّ, أَنَّ, إِنْ and أَنْ again.',
    words: [5, 31, 180, 179, 372, 96, 19, 17],
    steps: [
      { teach: `
        <h2>The mirror image of kāna</h2>
        <p>${A('إِنَّ')} "indeed" makes the <b>topic -a</b> and leaves the comment -u: ${A('إِنَّ اللّٰهَ غَفُورٌ رَحِيمٌ')}.</p>
        ${table(['Particle', 'Meaning', 'Example'], [
          [A('إِنَّ'), 'indeed, truly', A('إِنَّ اللّٰهَ مَعَ الصَّابِرِينَ')],
          [A('أَنَّ'), 'that', A('أَنَّ اللّٰهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ')],
          [A('لٰكِنَّ'), 'but', A('وَلٰكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ')],
          [A('كَأَنَّ'), 'as if', A('كَأَنَّهُمْ')],
          [A('لَعَلَّ'), 'perhaps, so that', A('لَعَلَّكُمْ تَتَّقُونَ')],
          [A('لَيْتَ'), 'if only', A('يَا لَيْتَنِي')],
        ])}
        <p>With pronouns: ${A('إِنَّهُ')} indeed he, ${A('إِنَّا')} indeed we, ${A('إِنِّي')} indeed I, ${A('لَعَلَّكُمْ')} so that you may.</p>` },
      { teach: `
        <h2>Four look-alikes</h2>
        ${table(['Word', 'Followed by', 'Meaning'], [
          [A('إِنَّ'), 'noun (-a)', 'indeed'], [A('أَنَّ'), 'noun (-a)', 'that'],
          [A('إِنْ'), 'verb', 'if (sometimes: not)'], [A('أَنْ'), 'verb (subjunctive)', 'to, that'],
        ])}
        <p>${A('إِنَّمَا')} = only: ${Q('49:10', '1-3')} "the believers are but brothers". An extra ${A('لَـ')} on the comment adds emphasis: ${Q('103:2')}</p>
        ${tr('<i>İnşallah</i> = ' + A('إِنْ شَاءَ اللّٰهُ') + ' uses the light ' + A('إِنْ') + ' "if", not ' + A('إِنَّ') + '.')}` },
      { quiz: `${A('إِنَّ اللّٰهَ مَعَ الصَّابِرِينَ')}`, o: ['Indeed, Allah is with the patient.', 'If Allah is with the patient…', 'That Allah is with the patient', 'Allah was with the patient.'], a: 0, why: 'إِنَّ "indeed" + topic اللّٰهَ + comment مَعَ الصَّابِرِينَ.' },
      { quiz: `${A('لَعَلَّكُمْ تَتَّقُونَ')}`, o: ['so that you may be mindful of Allah', 'indeed you are mindful', 'you were mindful', 'do not be mindful'], a: 0, why: 'لَعَلَّ "so that, perhaps".' },
      { quiz: '"if Allah wills" uses…', o: ['إِنْ', 'إِنَّ', 'أَنَّ', 'أَنْ'], a: 0, ar: true, why: 'إِنْ شَاءَ اللّٰهُ.' },
      { verse: '2:183', note: A('لَعَلَّكُمْ تَتَّقُونَ') + ' "so that you may become mindful" — a sister of ' + A('إِنَّ') + ' with a pronoun. (' + A('كَمَا') + ' is not one: it is ' + A('كَـ') + ' + ' + A('مَا') + ' "just as".) ' + A('كُتِبَ') + ' is passive (Lesson 26).' },
      { words: true },
    ],
  },
  {
    id: 'forms', unit: 5, title: 'The ten verb forms', ar: 'أَوْزَانُ الْفِعْلِ', mins: 14,
    goal: 'Recognize Forms II–X and the meaning each one adds — your Turkish vocabulary already knows them.',
    words: [193, 283, 67, 404, 217, 20, 115, 295, 229, 573, 329, 91, 290, 276],
    steps: [
      { teach: `
        <h2>One root, ten shapes</h2>
        <p>A root can enter up to ten verb patterns (<i>bāb</i>, Turkish <i>bab</i>). Each adds a typical nuance. The Turkish column is the masdar of that form — words you already use:</p>
        ${table(['Form', 'Past · present', 'Typical meaning', 'Quran', 'Türkçe masdar'], [
          ['I', A('فَعَلَ · يَفْعَلُ'), 'basic', A('عَلِمَ') + ' know', 'ilim'],
          ['II', A('فَعَّلَ · يُفَعِّلُ'), 'make someone do; intensive', A('عَلَّمَ') + ' teach', 'ta\'lim, tenzil, tesbih'],
          ['III', A('فَاعَلَ · يُفَاعِلُ'), 'do with / against someone', A('جَاهَدَ') + ' strive', 'mücahede, mukatele'],
          ['IV', A('أَفْعَلَ · يُفْعِلُ'), 'make something happen', A('أَنْزَلَ') + ' send down', 'iman, İslam, ihsan, ikram'],
          ['V', A('تَفَعَّلَ · يَتَفَعَّلُ'), 'do to oneself (of II)', A('تَوَكَّلَ') + ' rely', 'tevekkül, tefekkür'],
          ['VI', A('تَفَاعَلَ · يَتَفَاعَلُ'), 'do to each other', A('تَوَاصَوْا') + ' enjoin each other', 'tevazu, teavün'],
          ['VII', A('انْفَعَلَ · يَنْفَعِلُ'), 'undergo', A('انْقَلَبَ') + ' turn back', 'inkılap, infilak'],
          ['VIII', A('افْتَعَلَ · يَفْتَعِلُ'), 'do for oneself, with effort', A('اخْتَلَفَ') + ' differ', 'ihtilaf, ittiba, iftira, ictihat'],
          ['X', A('اسْتَفْعَلَ · يَسْتَفْعِلُ'), 'seek, ask for; consider', A('اسْتَغْفَرَ') + ' ask forgiveness', 'istiğfar, istikamet, istiklal'],
        ])}
        ${tr('You have been saying Arabic verb forms your whole life: <i>ta\'lîm</i> (II), <i>mücâhede</i> (III), <i>ikrâm</i> (IV), <i>tevekkül</i> (V), <i>teâvün</i> (VI), <i>inkılâb</i> (VII), <i>ihtilâf</i> (VIII), <i>istiğfâr</i> (X).')}` },
      { teach: `
        <h2>How to recognize a form quickly</h2>
        <ul>
          <li><b>Present prefix with u</b> (${A('يُـ')}): Forms II, III, IV — ${A('يُعَلِّمُ · يُجَاهِدُ · يُؤْمِنُ')}. With <b>a</b> (${A('يَـ')}): Forms I, V–X.</li>
          <li><b>Doubled middle letter</b> (shadda): II or V — ${A('نَزَّلَ · تَوَكَّلَ')}.</li>
          <li><b>Long ā after the first letter</b>: III or VI — ${A('قَاتَلَ · تَوَاصَى')}.</li>
          <li><b>ت after the first root letter</b>: VIII — ${A('اخْتَلَفَ')}. It merges with و/ت/ط/د: ${A('اتَّقَى')} (from و ق ي), ${A('اتَّبَعَ')}.</li>
          <li><b>اسْتَـ at the front</b>: X — ${A('اسْتَغْفَرَ · اسْتَكْبَرَ')}.</li>
        </ul>
        ${Q('110:3')}
        <p>${A('فَسَبِّحْ')} is Form II; ${A('اسْتَغْفِرْهُ')} is Form X; ${A('تَوَّابًا')} is a noun of intensity.</p>` },
      { quiz: `${A('اسْتَغْفَرَ')} is Form…`, o: ['X', 'VIII', 'IV', 'II'], a: 0, why: 'اسْتَـ + root غ ف ر.' },
      { quiz: 'Turkish <i>tevekkül</i> is the masdar of which form?', o: ['V (تَفَعَّلَ)', 'II (فَعَّلَ)', 'X (اسْتَفْعَلَ)', 'IV (أَفْعَلَ)'], a: 0, why: 'تَوَكَّلَ → تَوَكُّل.' },
      { quiz: `The prefix ${A('يُـ')} in ${A('يُؤْمِنُونَ')} tells you the verb is…`, o: ['Form II, III or IV', 'Form I', 'Form X', 'passive only'], a: 0, why: 'يُـ = Forms II–IV (it is IV: آمَنَ).' },
      { quiz: 'What does Form II often add to Form I?', o: ['causing someone to do it', 'asking for it', 'doing it to each other', 'undergoing it'], a: 0, why: 'عَلِمَ know → عَلَّمَ teach (make know).' },
      { quiz: `${A('اخْتَلَفُوا')} — which form?`, o: ['VIII', 'VII', 'III', 'X'], a: 0, ar: false, why: 'The ت after خ: اِخْتَلَفَ.' },
      { words: true },
    ],
  },
  {
    id: 'participles', unit: 5, title: 'Doers and the done-to', ar: 'اسْمُ الْفَاعِلِ وَاسْمُ الْمَفْعُولِ', mins: 11,
    goal: 'Read active and passive participles in every form.',
    words: [301, 260, 308, 196, 498, 306, 541, 327, 237, 485, 401],
    steps: [
      { teach: `
        <h2>Two patterns, a thousand words</h2>
        ${table(['', 'Form I', 'Other forms', 'Examples'], [
          ['Active — the doer (<i>ism al-fāʿil</i>)', A('فَاعِل'), A('مُـ') + ' + present stem with i', A('عَالِم · كَافِر · مُؤْمِن (IV) · مُعَلِّم (II) · مُسْتَقِيم (X)')],
          ['Passive — the done-to (<i>ism al-mafʿūl</i>)', A('مَفْعُول'), A('مُـ') + ' + present stem with a', A('مَعْلُوم · مَغْضُوب · مُرْسَل (IV) · مُنْزَل (IV)')],
        ])}
        ${tr('A gold mine for you: <i>mü\'min, Müslim, muallim, müezzin, müdür, mühendis, müstakîm</i> (active); <i>mektup, malum, mazlum, meşhur, mahluk, mahkûm, mevcut, mes\'ul</i> (passive). Turkish grammar even names them <i>ism-i fâil</i> and <i>ism-i mef\'ûl</i>.')}` },
      { teach: `
        <h2>They act like nouns and adjectives</h2>
        <p>Participles take ${A('الـ')}, cases and plurals: ${A('الْمُؤْمِنُونَ · الصَّالِحَاتِ · الضَّالِّينَ')}. Often they mean "those who…": ${A('الصَّابِرِينَ')} "those who are patient".</p>
        <p>In 1:7: ${Q('1:7', '6')} "those who have earned anger" (passive) and ${Q('1:7', '9')} "those who go astray" (active).</p>
        ${Q('1:7')}` },
      { quiz: `${A('مَغْضُوب')} (1:7) is…`, o: ['a passive participle: one who has incurred anger', 'an active participle: one who is angry', 'a past verb', 'a verbal noun'], a: 0, why: 'Pattern مَفْعُول.' },
      { quiz: 'Turkish <i>muallim</i> is the active participle of Form…', o: ['II — عَلَّمَ', 'I — عَلِمَ', 'IV — أَعْلَمَ', 'X — اسْتَعْلَمَ'], a: 0, why: 'مُعَلِّم: the one who teaches.' },
      { quiz: 'Which word is an active participle?', o: ['صَابِر', 'صَبْر', 'صَبَرَ', 'اصْبِرْ'], a: 0, ar: true, why: 'فَاعِل pattern: the one who is patient.' },
      { verse: '89:28', note: A('رَاضِيَةً') + ' (active) and ' + A('مَرْضِيَّةً') + ' (passive): "well-pleased and pleasing".' },
      { words: true },
    ],
  },
  {
    id: 'patterns', unit: 5, title: 'Verbal nouns, places and "-est"', ar: 'الْمَصْدَرُ وَاسْمُ الْمَكَانِ وَاسْمُ التَّفْضِيلِ', mins: 11,
    goal: 'Recognize maṣdars, place nouns (مَفْعَل) and the elative أَفْعَل.',
    words: [253, 148, 222, 614, 609, 385, 400, 386, 589, 432, 235, 321, 139, 355, 515],
    steps: [
      { teach: `
        <h2>The maṣdar: the action as a noun</h2>
        <p>Form I maṣdars vary — learn them with the verb: ${A('عِلْم · ذِكْر · خَلْق · صَبْر · قَوْل · رَحْمَة')}. Derived forms are regular:</p>
        ${table(['Form', 'Maṣdar', 'Example'], [
          ['II', A('تَفْعِيل'), A('تَنْزِيل') + ' sending down'], ['III', A('مُفَاعَلَة · فِعَال'), A('جِهَاد') + ' striving'],
          ['IV', A('إِفْعَال'), A('إِيمَان · إِسْلَام · إِحْسَان')], ['V', A('تَفَعُّل'), A('تَوَكُّل')],
          ['VIII', A('افْتِعَال'), A('اخْتِلَاف')], ['X', A('اسْتِفْعَال'), A('اسْتِغْفَار')],
        ])}
        ${tr('Turkish <i>masdar</i> is ' + A('مَصْدَر') + ' "source" — the form other words flow from.')}` },
      { teach: `
        <h2>Places and comparisons</h2>
        <p><b>Place / time:</b> ${A('مَفْعَل')} or ${A('مَفْعِل')} — ${A('مَسْجِد')} place of prostration (mescit), ${A('مَكْتَب')} (mektep), ${A('مَجْلِس')} (meclis), ${A('مَرْجِع')} place of return (merci), ${A('مَصِير')}.</p>
        <p><b>Elative</b> "more, most": ${A('أَفْعَل')} — ${A('أَكْبَر')} greater (Allâhu ekber), ${A('أَعْلَم')} knows best (vallâhu a\'lem), ${A('أَحْسَن')} best, ${A('أَكْثَر')} most (ekseriyet), ${A('أَقْرَب')} nearer (same root as <i>akraba</i>), ${A('أَشَدّ')} stronger. Feminine ${A('فُعْلَى')}: ${A('الْحُسْنَى · الْكُبْرَى · الدُّنْيَا')} — <i>dünya</i> is literally "the nearer (life)".</p>
        ${Q('95:4')}
        <p>${A('أَحْسَنِ تَقْوِيمٍ')} = elative + Form II maṣdar: "the best of forms" — Turkish <i>ahsen-i takvîm</i>.</p>` },
      { quiz: `${A('مَسْجِد')} literally means…`, o: ['place of prostration', 'one who prostrates', 'prostration', 'he prostrated'], a: 0, why: 'مَفْعِل = place.' },
      { quiz: `${A('اللّٰهُ أَكْبَرُ')}…`, o: ['Allah is greater (than all)', 'Allah is great and old', 'Allah made great', 'the greatness of Allah'], a: 0, why: 'أَكْبَر is the elative of كَبِير.' },
      { quiz: 'Which is the maṣdar of a Form IV verb?', o: ['إِيمَان', 'تَنْزِيل', 'اسْتِغْفَار', 'تَوَكُّل'], a: 0, ar: true, why: 'إِفْعَال: آمَنَ → إِيمَان.' },
      { words: true },
    ],
  },
  {
    id: 'weak', unit: 5, title: 'Weak verbs: the common verbs bend', ar: 'الْفِعْلُ الْمُعْتَلُّ', mins: 13,
    goal: 'Find hidden root letters in قَالَ, يَقُولُ, اهْدِ, يَجِدُ and friends.',
    words: [69, 86, 174, 494, 211, 220, 249, 184, 346, 304, 136, 334],
    steps: [
      { teach: `
        <h2>When a root letter is و or ي</h2>
        <p>Roots with a weak letter (<i>ḥarf ʿilla</i>, Turkish <i>harf-i illet</i>) change shape. They include the most frequent verbs of all, so four patterns unlock thousands of words:</p>
        ${table(['Type', 'Example (root)', 'Past', 'Present', 'Command'], [
          ['Hollow — middle و/ي (<i>ecvef</i>)', 'ق و ل', A('قَالَ · قُلْتُ'), A('يَقُولُ'), A('قُلْ')],
          ['', 'ك و ن', A('كَانَ · كُنْتُمْ'), A('يَكُونُ'), A('كُنْ')],
          ['Defective — last و/ي (<i>nâkıs</i>)', 'د ع و', A('دَعَا'), A('يَدْعُو'), A('اُدْعُ')],
          ['', 'ه د ي', A('هَدَى'), A('يَهْدِي'), A('اِهْدِ')],
          ['Assimilated — first و (<i>misal</i>)', 'و ج د', A('وَجَدَ'), A('يَجِدُ'), '—'],
          ['', 'و ع د', A('وَعَدَ'), A('يَعِدُ'), '—'],
          ['Doubled (<i>mudâaf</i>)', 'ض ل ل', A('ضَلَّ'), A('يَضِلُّ'), '—'],
          ['', 'ح ب ب (IV)', A('أَحَبَّ'), A('يُحِبُّ'), '—'],
        ])}` },
      { teach: `
        <h2>The rule of thumb</h2>
        <p>If a verb seems to have only <b>two</b> root letters, a weak letter is hiding:</p>
        <ul>
          <li>${A('يَقُولُ')} → ق _ ل → ${A('ق و ل')}</li>
          <li>${A('يَجِدُونَ')} → _ ج د → ${A('و ج د')} (first و vanishes in the present)</li>
          <li>${A('اهْدِنَا')} → ه د _ → ${A('ه د ي')} (last letter drops in commands)</li>
          <li>${A('لَمْ يَرَ')} / ${A('أَلَمْ تَرَ')} → ر _ _ → ${A('ر أ ي')} "see" (hamza and ي both hide!)</li>
        </ul>
        ${tip('The Reader shows the root of every word, so you can always check your guess.')}
        ${Q('105:1')}` },
      { quiz: `The root of ${A('يَقُولُ')} is…`, o: ['ق و ل', 'ق ل ل', 'ي ق ل', 'ق ي ل'], a: 0, ar: true, why: 'Hollow verb: the و shows as the long ū.' },
      { quiz: `The root of ${A('يَجِدُونَ')} is…`, o: ['و ج د', 'ج د د', 'ي ج د', 'ج و د'], a: 0, ar: true, why: 'The first و disappears in the present.' },
      { quiz: `${A('اهْدِنَا')} is a command of…`, o: ['هَدَى to guide', 'هَدَّ to destroy', 'أَهْدَى to give a gift', 'هَادَ to be Jewish'], a: 0, why: 'اِهْدِ + نَا "guide us".' },
      { quiz: `${A('لَمْ يَرَ')} means…`, o: ['he did not see', 'he will not see', 'do not see!', 'he does not see'], a: 0, why: 'لَمْ + jussive of رَأَى — past meaning.' },
      { words: true },
    ],
  },
  {
    id: 'passive', unit: 5, title: 'The passive voice', ar: 'الْمَبْنِيُّ لِلْمَجْهُولِ', mins: 9,
    goal: 'Recognize passive verbs from their vowels: ku-ti-ba, yu-k-ta-bu.',
    words: [303, 503, 472, 526, 443, 552],
    steps: [
      { teach: `
        <h2>Change the vowels, hide the doer</h2>
        ${table(['', 'Active', 'Passive', 'Meaning'], [
          ['past (u – i)', A('كَتَبَ'), A('كُتِبَ'), 'it was written / prescribed'],
          ['', A('خَلَقَ'), A('خُلِقَ'), 'was created'],
          ['Form IV past', A('أَنْزَلَ'), A('أُنْزِلَ'), 'was sent down'],
          ['present (u – a)', A('يَكْتُبُ'), A('يُكْتَبُ'), 'is written'],
          ['', A('يَخْلُقُونَ'), A('يُخْلَقُونَ'), 'they are created (25:3 has both)'],
        ])}
        ${tr('Turkish grammar calls it <i>meçhul</i> "unknown" — the Arabic ' + A('مَجْهُول') + '. In the Quran the hidden doer is usually Allah, or the doer does not matter.')}` },
      { teach: `
        <h2>The object moves up</h2>
        <p>In a passive sentence the old object becomes the subject (-u): ${Q('2:183', '4-6')} "fasting has been prescribed for you" — ${A('الصِّيَامُ')} ends in -u.</p>
        <p>Very common: ${A('وَإِلَيْهِ تُرْجَعُونَ')} "and to Him you will be returned"; ${A('وَنُفِخَ فِي الصُّورِ')} "and the Horn will be blown".</p>
        ${Q('2:4', '3-5')}` },
      { quiz: `${A('كُتِبَ')} means…`, o: ['it was written / prescribed', 'he wrote', 'write!', 'a book'], a: 0, why: 'u – i vowels: passive past.' },
      { quiz: `${A('تُرْجَعُونَ')} means…`, o: ['you will be returned', 'you return', 'they will return', 'return! (pl.)'], a: 0, why: 'تُـ … ـَعُونَ with u–a vowels: passive.' },
      { quiz: 'Which verb is passive?', o: ['أُنْزِلَ', 'أَنْزَلَ', 'يُنْزِلُ', 'نَزَّلَ'], a: 0, ar: true, why: 'Form IV passive: u – i.' },
      { verse: '49:10', note: A('تُرْحَمُونَ') + ' "you may receive mercy" — a passive present at the end.' },
      { words: true },
    ],
  },
];
