// Units 6–7 — Particles that shape meaning; reading the Quran
import { A, Q, table, tr, tip, key } from './kit.js';

export default [
  {
    id: 'negation', unit: 6, title: 'Saying no: the negations', ar: 'أَدَوَاتُ النَّفْيِ', mins: 10,
    goal: 'Tell لَا, مَا, لَمْ, لَنْ, لَيْسَ and إِنْ apart at a glance.',
    words: [4, 15, 33, 113, 82],
    steps: [
      { teach: `
        <h2>Six ways to say "not"</h2>
        ${table(['Word', 'With', 'Meaning', 'Example'], [
          [A('لَا'), 'present verb', 'does not', A('لَا يَعْلَمُونَ') + ' they do not know'],
          [A('لَا'), 'jussive', 'do not!', A('لَا تَحْزَنْ') + ' do not grieve'],
          [A('لَا'), 'noun (-a)', 'there is no', A('لَا رَيْبَ') + ' · ' + A('لَا إِلٰهَ إِلَّا اللّٰهُ')],
          [A('مَا'), 'past verb', 'did not', A('مَا ظَلَمْنَاهُمْ') + ' We did not wrong them'],
          [A('لَمْ'), 'jussive', '<b>did</b> not (past!)', A('لَمْ يَلِدْ') + ' He did not beget'],
          [A('لَنْ'), 'subjunctive', 'will never', A('لَنْ تَرَانِي') + ' you will never see Me'],
          [A('لَيْسَ'), 'noun', 'is not', A('لَيْسَ كَمِثْلِهِ شَيْءٌ')],
          [A('إِنْ … إِلَّا'), 'sentence', 'nothing but', A('إِنْ هُوَ إِلَّا ذِكْرٌ') + ' it is nothing but a reminder'],
        ])}
        ${key(A('لَمْ') + ' takes a present-looking verb but means the past: ' + A('لَمْ يَلِدْ وَلَمْ يُولَدْ') + ' "He did not beget, nor was He begotten".')}` },
      { teach: `
        <h2>See them in one surah</h2>
        ${Q('112:3')}
        ${Q('112:4')}
        <p>${A('غَيْر')} "other than, non-" negates nouns: ${A('غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ')} "not (the way) of those who earned anger".</p>` },
      { quiz: `${A('لَمْ يَلِدْ')}`, o: ['He did not beget.', 'He does not beget.', 'He will never beget.', 'Do not beget!'], a: 0, why: 'لَمْ + jussive = past negation.' },
      { quiz: '"there is no doubt"', o: ['لَا رَيْبَ', 'لَمْ رَيْبٌ', 'لَنْ رَيْبٌ', 'مَا رَيْبَ'], a: 0, ar: true, why: 'لَا + noun with -a: "there is no…".' },
      { quiz: `${A('لَنْ')} means…`, o: ['will never', 'did not', 'is not', 'do not!'], a: 0, why: 'لَنْ + subjunctive negates the future.' },
      { quiz: 'Which negation makes a present-looking verb mean the past?', o: ['لَمْ', 'لَا', 'لَنْ', 'لَيْسَ'], a: 0, ar: true, why: 'لَمْ يَعْلَمْ = he did not know.' },
      { words: true },
    ],
  },
  {
    id: 'questions', unit: 6, title: 'Asking questions', ar: 'الِاسْتِفْهَامُ', mins: 10,
    goal: 'Read the question words — and the rhetorical questions the Quran loves.',
    words: [117, 4800, 135, 516, 381, 418, 483, 56],
    steps: [
      { teach: `
        <h2>Yes/no and wh- questions</h2>
        ${table(['Word', 'Meaning', 'Example'], [
          [A('أَ · هَلْ'), 'yes/no question', A('هَلْ أَتَاكَ حَدِيثُ…') + ' has the story of … reached you?'],
          [A('مَا · مَاذَا'), 'what?', A('مَاذَا أَرَادَ اللّٰهُ') + ' what did Allah intend?'],
          [A('مَنْ'), 'who?', A('مَنْ خَلَقَ') + ' who created?'],
          [A('أَيْنَ'), 'where?', A('فَأَيْنَ تَذْهَبُونَ') + ' so where are you going?'],
          [A('كَيْفَ'), 'how?', A('كَيْفَ فَعَلَ رَبُّكَ') + ' how your Lord dealt'],
          [A('أَنَّى'), 'how? from where?', A('أَنَّى يَكُونُ لِي غُلَامٌ') + ' how can I have a boy?'],
          [A('كَمْ'), 'how many!', A('كَمْ أَهْلَكْنَا') + ' how many We destroyed'],
          [A('أَيّ'), 'which?', A('فَبِأَيِّ آلَاءِ رَبِّكُمَا')],
          [A('لِمَ'), 'why?', A('لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ')],
        ])}
        ${tr('<i>Keyif</i> (mood, state) is ' + A('كَيْف') + ' — "how (you are)".')}` },
      { teach: `
        <h2>Questions that are really calls</h2>
        <p>${A('أَلَمْ تَرَ')} "Have you not seen?" — an invitation to look. ${A('أَفَلَا تَعْقِلُونَ')} "Will you not reason?" — a call to think. ${A('وَمَا أَدْرَاكَ مَا…')} "And what will make you know what … is?" — announcing something too great to describe.</p>
        ${Q('55:13')}
        <p>Repeated 31 times in Sūrat ar-Raḥmān: "So which of the favors of your Lord would you two deny?" — ${A('تُكَذِّبَانِ')} is dual (jinn and humans).</p>` },
      { quiz: `${A('أَلَمْ تَرَ')}`, o: ['Have you not seen?', 'You did not see.', 'Do not look!', 'Will you see?'], a: 0, why: 'أَ (question) + لَمْ + تَرَ.' },
      { quiz: `${A('كَيْفَ')} means…`, o: ['how', 'where', 'when', 'who'], a: 0, why: 'Turkish keyif.' },
      { quiz: `${A('أَفَلَا تَعْقِلُونَ')}`, o: ['Will you not then use reason?', 'You do not understand.', 'Do not reason!', 'They did not understand.'], a: 0, why: 'أَ + فَـ + لَا + present.' },
      { verse: '105:1' }, { verse: '105:2' }, { verse: '105:3' }, { verse: '105:4' }, { verse: '105:5', note: 'Sūrat al-Fīl opens with a rhetorical question and ' + A('كَيْفَ') + '.' },
      { words: true },
    ],
  },
  {
    id: 'conditions', unit: 6, title: 'If and when', ar: 'الشَّرْطُ وَالظَّرْفُ', mins: 11,
    goal: 'Read conditional sentences with إِنْ, إِذَا, لَوْ, مَنْ — and time words إِذْ, لَمَّا.',
    words: [27, 59, 154, 79, 53, 617, 453, 213],
    steps: [
      { teach: `
        <h2>Conditions</h2>
        ${table(['Word', 'Use', 'Example'], [
          [A('إِنْ'), 'if (real possibility)', A('إِنْ تَنْصُرُوا اللّٰهَ يَنْصُرْكُمْ') + ' if you help Allah, He will help you'],
          [A('إِذَا'), 'when (it will surely happen)', A('إِذَا جَاءَ نَصْرُ اللّٰهِ')],
          [A('لَوْ'), 'if (unreal)', A('لَوْ شَاءَ اللّٰهُ') + ' had Allah willed'],
          [A('لَوْلَا'), 'if not for; why not?', A('لَوْلَا فَضْلُ اللّٰهِ') + ' were it not for the bounty of Allah'],
          [A('مَنْ'), 'whoever', A('مَنْ يَعْمَلْ… يَرَهُ')],
        ])}
        <ul>
          <li>After ${A('إِنْ')} and ${A('مَنْ')} both verbs are jussive: ${A('يَنْصُرْكُمْ')}.</li>
          <li>A past verb after ${A('إِذَا')} or ${A('إِنْ')} usually means the future: ${A('إِذَا جَاءَ')} "when it comes".</li>
          <li>The answer often starts with ${A('فَـ')}: ${A('… فَسَبِّحْ')} (110:3).</li>
        </ul>
        ${Q('47:7', '4-7')}` },
      { teach: `
        <h2>Time words</h2>
        ${table(['Word', 'Meaning'], [
          [A('إِذْ'), 'when (in the past); "and (remember) when…"'],
          [A('لَمَّا'), 'when (past); with a jussive: not yet'],
          [A('كُلَّمَا'), 'whenever, every time'],
          [A('إِمَّا … وَإِمَّا'), 'either … or'],
          [A('أَمَّا … فَـ'), 'as for … (then)'],
        ])}
        ${Q('99:7')}
        ${Q('99:8')}` },
      { quiz: `${A('لَوْ شَاءَ اللّٰهُ')}`, o: ['If Allah had willed', 'If Allah wills', 'What Allah willed', 'Allah willed'], a: 0, why: 'لَوْ = unreal condition.' },
      { quiz: `${A('إِذَا جَاءَ نَصْرُ اللّٰهِ')}`, o: ['When the help of Allah comes', 'If only Allah\'s help had come', 'The help of Allah came.', 'Whoever helps Allah'], a: 0, why: 'إِذَا + past = future "when".' },
      { quiz: `In 99:7, ${A('يَرَهُ')} means…`, o: ['he will see it', 'he saw him', 'see it!', 'they see it'], a: 0, why: 'Jussive of يَرَى (answer of the condition) + هُ.' },
      { words: true },
    ],
  },
  {
    id: 'particles', unit: 6, title: 'Small words, big meaning', ar: 'حُرُوفُ الْمَعَانِي', mins: 11,
    goal: 'Master the particles that steer every verse: qad, sawfa, thumma, bal, illā, kallā, balā, yā.',
    words: [26, 35, 42, 89, 98, 18, 345, 468, 4802, 302, 87],
    steps: [
      { teach: `
        <h2>The particle toolkit</h2>
        ${table(['Particle', 'Meaning', 'Note'], [
          [A('قَدْ · لَقَدْ'), 'indeed, already (+ past)', A('لَقَدْ خَلَقْنَا') + ' We have certainly created'],
          [A('سَـ · سَوْفَ'), 'will', A('سَوْفَ تَعْلَمُونَ')],
          [A('وَ · فَـ · ثُمَّ'), 'and · and so (at once) · then (later)', ''],
          [A('أَوْ · أَمْ'), 'or · or (in questions)', ''],
          [A('بَلْ'), 'rather, no — correcting', ''],
          [A('إِلَّا · إِنَّمَا'), 'except · only', ''],
          [A('حَتَّى'), 'until; even', 'Turkish <i>hatta</i>'],
          [A('كَلَّا'), 'No! Never!', 'a firm rejection'],
          [A('بَلَى'), 'Yes indeed! (to a negative question)', 'Turkish <i>kalû belâ</i>'],
          [A('يَا · يَا أَيُّهَا'), 'O … !', A('يَا أَيُّهَا النَّاسُ')],
          [A('أَلَا'), 'Indeed! Listen!', A('أَلَا بِذِكْرِ اللّٰهِ تَطْمَئِنُّ الْقُلُوبُ')],
        ])}` },
      { teach: `
        <h2>Belâ and the oaths</h2>
        ${tr('The Turkish idiom <i>kalû belâ</i> ("since the beginning of time") quotes 7:172: Allah asked the souls ' + A('أَلَسْتُ بِرَبِّكُمْ') + ' "Am I not your Lord?" and they said ' + A('بَلَى') + ' "Yes indeed!"')}
        ${Q('7:172', '13-16')}
        <p><b>Oaths</b>: ${A('وَ')} + genitive swears by something: ${A('وَالْعَصْرِ · وَالشَّمْسِ · وَاللَّيْلِ')} "By…!". The point being sworn to usually follows with ${A('إِنَّ')} or ${A('لَقَدْ')}.</p>
        ${Q('103:1')}${Q('103:2')}${Q('103:3')}` },
      { quiz: `${A('لَقَدْ خَلَقْنَا الْإِنْسَانَ')}`, o: ['We have certainly created man.', 'We will create man.', 'Did We create man?', 'We did not create man.'], a: 0, why: 'لَـ + قَدْ + past = certainty.' },
      { quiz: `${A('بَلَى')} is used to answer…`, o: ['a negative question: "Yes, indeed"', 'any question: "no"', 'a command', 'a greeting'], a: 0, why: 'أَلَسْتُ بِرَبِّكُمْ؟ — بَلَى.' },
      { quiz: `${A('يَا أَيُّهَا النَّاسُ')}`, o: ['O mankind!', 'Which people?', 'Those people', 'People of Yā'], a: 0, why: 'يَا + أَيُّهَا + noun with ال.' },
      { quiz: `${A('وَالْعَصْرِ')}`, o: ['By time!', 'and the time', 'and in time', 'until the afternoon'], a: 0, why: 'وَ of the oath + genitive.' },
      { words: true },
    ],
  },
  {
    id: 'fatiha', unit: 7, title: 'Al-Fātiḥa, word by word', ar: 'سُورَةُ الْفَاتِحَةِ', mins: 14,
    goal: 'Understand every word and every ending of the surah you recite every day.',
    words: [1626, 3845, 571, 648],
    steps: [
      { teach: `<h2>You already know all of it</h2><p>Every grammar point in al-Fātiḥa is now familiar. Read each verse, tap the words, then check the notes. Recite it slowly afterwards — you will hear it differently.</p>` },
      { verse: '1:1', note: A('بِسْمِ') + ' = ' + A('بِـ') + ' + ' + A('اسْم') + ', the first noun of an iḍāfa with ' + A('اللّٰه') + '. ' + A('الرَّحْمٰنِ الرَّحِيمِ') + ' are two adjectives agreeing with ' + A('اللّٰهِ') + ' (definite, genitive). Something unsaid is understood before it: "(I begin) in the name of Allah".' },
      { verse: '1:2', note: 'Nominal sentence: topic ' + A('الْحَمْدُ') + ' (-u), comment ' + A('لِلّٰهِ') + '. ' + A('رَبِّ الْعَالَمِينَ') + ' is an iḍāfa describing Allah, so it copies the -i.' },
      { verse: '1:3' },
      { verse: '1:4', note: A('مَالِكِ') + ' is the active participle "owner, master"; ' + A('مَالِكِ يَوْمِ الدِّينِ') + ' is a three-noun iḍāfa chain.' },
      { verse: '1:5', note: A('إِيَّاكَ') + ' (the object) comes <b>before</b> the verb: "<b>You alone</b> we worship". Moving the object forward restricts it (<i>ḥaṣr</i>). ' + A('نَسْتَعِينُ') + ' is Form X of ع و ن: "we seek help".' },
      { verse: '1:6', note: A('اهْدِ') + ' is the command of ' + A('هَدَى') + ' (its last letter drops) + ' + A('نَا') + ' "us". ' + A('الصِّرَاطَ الْمُسْتَقِيمَ') + ' = noun + adjective, -a as the thing we ask for.' },
      { verse: '1:7', note: A('صِرَاطَ الَّذِينَ') + ' iḍāfa + relative clause; ' + A('أَنْعَمْتَ') + ' Form IV past, "You (sg.) bestowed favor"; ' + A('الْمَغْضُوبِ') + ' passive participle; ' + A('الضَّالِّينَ') + ' active participle plural of ' + A('ضَلَّ') + '.' },
      { quiz: `${A('نَسْتَعِينُ')} is Form X. What does it mean?`, o: ['we seek help', 'we help', 'we helped each other', 'help us!'], a: 0, why: 'Form X = seeking: "we ask for help".' },
      { quiz: `Why is ${A('إِيَّاكَ')} placed before the verb?`, o: ['For emphasis: You alone', 'Because it is the subject', 'Because verbs come last in Arabic', 'It is a question'], a: 0, why: 'Fronting the object restricts it: none but You.' },
      { quiz: `${A('أَنْعَمْتَ عَلَيْهِمْ')}`, o: ['You bestowed favor on them', 'They bestowed favor on You', 'He bestowed favor on them', 'bestow favor on them!'], a: 0, why: 'ـتَ = you (m. sg.); عَلَيْهِمْ = on them.' },
      { words: true },
    ],
  },
  {
    id: 'kursi', unit: 7, title: 'Āyat al-Kursī', ar: 'آيَةُ الْكُرْسِيِّ', mins: 15,
    goal: 'Read the greatest verse of the Quran (2:255) phrase by phrase.',
    words: [435, 1868, 3385, 1950, 1434, 2461, 1247, 4658, 1762, 768],
    steps: [
      { teach: `<h2>Ten sentences about Allah</h2><p>Āyat al-Kursī is a chain of short sentences, each one about Allah. You know every structure in it: nominal sentences, ${A('لَا')} of "there is no", relative clauses, iḍāfa, negated verbs. First read it whole, then phrase by phrase.</p>${Q('2:255')}` },
      { teach: `
        <h2>Phrase by phrase</h2>
        ${table(['Phrase', 'Meaning', 'Grammar'], [
          [Q('2:255', '1-5'), 'Allah — there is no god but Him', 'topic + ' + A('لَا') + ' of absolute negation + ' + A('إِلَّا')],
          [Q('2:255', '6-7'), 'the Ever-Living, the Self-Sustaining', 'two more comments (both -u)'],
          [Q('2:255', '8-12'), 'neither drowsiness nor sleep overtakes Him', A('لَا') + ' + present; ' + A('ـهُ') + ' = Him'],
          [Q('2:255', '13-19'), 'His is whatever is in the heavens and the earth', A('لَهُ') + ' (comment first) + ' + A('مَا')],
          [Q('2:255', '20-26'), 'who could intercede with Him except by His permission?', A('مَنْ ذَا الَّذِي') + ' rhetorical question'],
          [Q('2:255', '27-32'), 'He knows what is before them and behind them', A('بَيْنَ أَيْدِيهِمْ') + ' "between their hands"'],
          [Q('2:255', '33-40'), 'they encompass nothing of His knowledge except what He wills', A('لَا يُحِيطُونَ') + ' Form IV'],
          [Q('2:255', '41-44'), 'His Kursī extends over the heavens and the earth', 'verb ' + A('وَسِعَ') + ' + subject + object'],
          [Q('2:255', '45-47'), 'guarding them does not tire Him', A('حِفْظُهُمَا') + ' masdar + dual pronoun'],
          [Q('2:255', '48-50'), 'and He is the Most High, the Most Great', 'pronoun + two comments'],
        ])}` },
      { quiz: `${A('لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ')}`, o: ['Neither drowsiness nor sleep overtakes Him.', 'He does not take sleep from anyone.', 'Do not let sleep take you.', 'There was no sleep for Him.'], a: 0, why: 'لَا + present; the subjects سِنَةٌ and نَوْمٌ come after the verb.' },
      { quiz: `${A('مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ')} is…`, o: ['a rhetorical question: no one can', 'a command to intercede', 'a statement that someone did intercede', 'a condition'], a: 0, why: 'مَنْ "who?" — the answer is: no one, except by His permission.' },
      { quiz: `In ${A('حِفْظُهُمَا')}, ${A('ـهُمَا')} refers to…`, o: ['the heavens and the earth (two)', 'two angels', 'the believers', 'Allah'], a: 0, why: 'The dual pronoun points back to السَّمَاوَات and الْأَرْض.' },
      { words: true },
    ],
  },
  {
    id: 'shortsurahs', unit: 7, title: 'The last surahs of the Quran', ar: 'قِصَارُ السُّوَرِ', mins: 16,
    goal: 'Read al-Kawthar, al-Ikhlāṣ, al-Falaq and an-Nās with full understanding.',
    words: [3457, 3714, 935, 3630, 3572, 4653, 4168, 1538, 3096, 2017, 4229, 3180, 3537, 2259, 1401, 1326, 710, 3646, 2838, 1815, 1835, 3760, 765],
    steps: [
      { teach: `<h2>The surahs you recite in every prayer</h2><p>These short surahs are built from what you now know. For each one: read, tap unknown words, then read the note. Open any of them in the Quran tab afterwards and watch how much of it is green.</p>` },
      { verse: '108:1', note: A('إِنَّا') + ' "indeed We" + ' + A('أَعْطَيْنَاكَ') + ' "We have given you" (Form IV past + نَا + كَ) + ' + A('الْكَوْثَرَ') + ' (object, -a): a river in Paradise / abundant good.' },
      { verse: '108:2', note: 'Two commands joined by ' + A('وَ') + ' after ' + A('فَـ') + ': "so pray to your Lord and sacrifice".' },
      { verse: '108:3', note: A('شَانِئَكَ') + ' "the one who hates you" (active participle + كَ) — ' + A('هُوَ الْأَبْتَرُ') + ' "he is the one cut off".' },
      { verse: '112:1' }, { verse: '112:2', note: A('الصَّمَدُ') + ': the One whom all creation needs, who needs no one.' },
      { verse: '112:3', note: A('لَمْ') + ' + jussive twice; the second verb is passive: ' + A('يُولَدْ') + ' "He was not born".' },
      { verse: '112:4', note: A('كُفُوًا') + ' is the comment of ' + A('يَكُنْ') + ' (fronted, -an); the subject ' + A('أَحَدٌ') + ' comes last.' },
      { verse: '113:1' }, { verse: '113:2', note: A('مِنْ شَرِّ مَا خَلَقَ') + ' "from the evil of what He created" — iḍāfa + relative ' + A('مَا') + '.' },
      { verse: '113:3' }, { verse: '113:4', note: A('النَّفَّاثَاتِ') + ' "those (f.) who blow" — intensive pattern ' + A('فَعَّال') + ' in the feminine plural.' },
      { verse: '113:5' },
      { verse: '114:1' }, { verse: '114:2' }, { verse: '114:3', note: 'Three iḍāfas with النَّاس: Lord, King, God of mankind.' },
      { verse: '114:4' }, { verse: '114:5', note: A('يُوَسْوِسُ') + ' "whispers" — Turkish <i>vesvese</i>.' }, { verse: '114:6' },
      { quiz: `${A('لَمْ يَلِدْ وَلَمْ يُولَدْ')}`, o: ['He did not beget, nor was He begotten.', 'He will not beget and will not be born.', 'Do not beget and do not be born.', 'He begets and is not born.'], a: 0, why: 'لَمْ + jussive = past; يُولَدْ is passive.' },
      { quiz: `${A('مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ')}`, o: ['from the evil of the whisperer who withdraws', 'from the whispering evil of mankind', 'evil whispers withdraw', 'from the evil that the whisperer did'], a: 0, why: 'iḍāfa شَرِّ + الْوَسْوَاسِ, with the adjective الْخَنَّاسِ.' },
      { words: true },
    ],
  },
  {
    id: 'onward', unit: 7, title: 'How to keep going', ar: 'الطَّرِيقُ أَمَامَكَ', mins: 6,
    goal: 'A simple daily routine and a reading plan for the coming months.',
    words: [],
    steps: [
      { teach: `
        <h2>You have the whole toolkit</h2>
        <p>You now know the grammar that carries the Quran. From here, growth comes from two things: <b>more words</b> and <b>more reading</b>.</p>
        ${table(['Every day (20–30 min)', ''], [
          ['Review', 'Clear your due cards first. Never let them pile up.'],
          ['New words', '10–20 until you finish the 700 core words (Home shows your coverage).'],
          ['Read', 'One page of Quran in the Reader with known-word colors on. Tap only the grey words.'],
          ['Listen', 'Play the recitation of what you read; follow the words.'],
        ])}` },
      { teach: `
        <h2>A reading path</h2>
        <ol>
          <li><b>Juz ʿAmma</b> (surahs 78–114): short, rhythmic, many repeated words.</li>
          <li><b>Al-Mulk (67)</b> and <b>Yā-Sīn (36)</b>: beloved, clear narrative and argument.</li>
          <li><b>Al-Kahf (18)</b> and <b>Maryam (19)</b>: stories — the easiest long-form reading.</li>
          <li><b>Al-Baqara (2)</b>: slowly, a page a day. Its vocabulary appears everywhere.</li>
        </ol>
        ${tip('In the Quran tab every surah shows how much of it you already know. Pick ones above 80% — reading with few unknown words is how fluency grows.')}
        ${tr('When a word feels new, check its Turkish cousins in the word sheet first. Often you already know it — <i>vesvese, kürsü, sayfiye, ukde</i> were all hiding in plain sight.')}
        ${Q('54:17')}` },
      { quiz: 'What should you do first each day?', o: ['Clear the due reviews', 'Start a new lesson', 'Read a long surah', 'Learn 50 new words'], a: 0, why: 'Reviews keep what you already learned; they are the cheapest minutes of your day.' },
    ],
  },
];
