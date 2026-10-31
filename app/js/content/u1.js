// Unit 1 — Foundations
import { A, Q, table, tr, tip, key, ex } from './kit.js';

export default [
  {
    id: 'welcome', unit: 1, title: 'How Quranic Arabic works', ar: 'كَيْفَ تَعْمَلُ اللُّغَةُ', mins: 8,
    goal: 'See why the Quran is learnable fast — and why Turkish gives you a head start.',
    words: [2, 12, 49, 92, 106, 112, 165, 172],
    steps: [
      { teach: `
        <h2>Welcome. You are closer than you think.</h2>
        <p>You already read Arabic script with its vowels. What is left is <b>meaning</b>: words and the grammar that joins them. The Quran has 77,429 words, but they are built from far fewer pieces.</p>
        ${table(['Learn this many words', '…and you know the core of'], [
          ['the top 100', '59% of all words in the Quran'],
          ['the top 300', '75%'],
          ['the top 650 (this course)', '85%'],
        ])}
        <p>Lisan teaches exactly those words, in order of how often they appear, together with the grammar you need to read real verses.</p>
        ${key('Three habits, every day: <b>one lesson</b> (10 minutes), <b>new words</b> (15 a day), and <b>review</b> (the app schedules each word just before you would forget it). Then read real Quran in the Reader, where the words you know turn green.')}` },
      { teach: `
        <h2>Your Turkish head start</h2>
        <p>Turkish took in thousands of Arabic words, especially religious and literary ones. Many Quranic words are already in your head:</p>
        ${table(['Quran', 'Türkçe', 'English'], [
          [A('كِتَاب'), 'kitap', 'book'], [A('قَلْب'), 'kalp', 'heart'], [A('رَحْمَة'), 'rahmet', 'mercy'],
          [A('عِلْم'), 'ilim', 'knowledge'], [A('إِنْسَان'), 'insan', 'human being'], [A('صَبْر'), 'sabır', 'patience'],
          [A('حَقّ'), 'hak', 'truth, right'], [A('دُنْيَا'), 'dünya', 'this world'], [A('عَذَاب'), 'azap', 'punishment'],
        ])}
        ${tr('Even Ottoman phrases you know from prayers are pure Arabic grammar: <i>Rabbü\'l-âlemîn</i> is ' + A('رَبُّ الْعَالَمِينَ') + ' "Lord of the worlds"; <i>sırât-ı müstakîm</i> is ' + A('الصِّرَاطُ الْمُسْتَقِيمُ') + ' "the straight path". You will learn exactly why they are built that way.')}` },
      { teach: `
        <h2>Roots: one key opens ten doors</h2>
        <p>Most Arabic words grow from a <b>root</b> of three letters that carries a basic idea. Patterns of vowels and extra letters shape that idea into words. The root ${A('ع ل م')} means <i>knowing</i>:</p>
        ${table(['Word', 'Pattern', 'Meaning', 'Türkçe'], [
          [A('عَلِمَ'), 'he did it', 'he knew', '—'], [A('عِلْم'), 'the action', 'knowledge', 'ilim'],
          [A('عَالِم'), 'the doer', 'scholar, knower', 'âlim'], [A('عَلِيم'), 'quality', 'all-knowing', 'Alîm'],
          [A('مَعْلُوم'), 'the done-to', 'known', 'malum'], [A('مُعَلِّم'), 'who causes it', 'teacher', 'muallim'],
          [A('عَالَم'), 'means of it', 'world (sign of God)', 'âlem'],
        ])}
        <p>The same works with ${A('ك ت ب')} <i>writing</i>: ${A('كَتَبَ')} he wrote, ${A('كِتَاب')} book (kitap), ${A('كَاتِب')} writer (kâtip), ${A('مَكْتُوب')} written (mektup).</p>
        ${tip('Every word in the Reader shows its root. When you meet a new word, ask: which root? You will often know its meaning before you look it up.')}` },
      { quiz: `${A('كِتَاب')}, ${A('كَاتِب')} and ${A('مَكْتُوب')} share which root?`, o: ['ك ت ب', 'ك ب ت', 'ت ك ب', 'م ك ت'], a: 0, ar: true,
        why: 'Strip the pattern letters (the long vowels and the مَـ prefix) and ك ت ب is what is left.' },
      { quiz: `What does ${A('عِلْم')} mean? (Turkish: <i>ilim</i>)`, o: ['knowledge', 'world', 'flag', 'teacher'], a: 0,
        why: 'عِلْم is the verbal noun of عَلِمَ "to know" — Turkish ilim.' },
      { quiz: 'Turkish <i>mahluk</i> (creature) comes from the root of which verb?', o: [A('خَلَقَ') + ' to create', A('خَرَجَ') + ' to go out', A('قَتَلَ') + ' to kill', A('أَكَلَ') + ' to eat'], a: 0,
        why: 'مَخْلُوق "created one" → Turkish mahluk. Same root as halk, ahlak and Halik.' },
      { verse: '1:1', note: `Tap each word. ${A('بِسْمِ')} is ${A('بِـ')} "in, with" + ${A('اسْم')} "name" (Turkish <i>isim</i>). Notice how the Reader colors words once you learn them.` },
      { words: true },
      { teach: `
        <h2>How to use Lisan</h2>
        <ul>
          <li><b>Course</b>: 34 short lessons, from roots to reading whole surahs. Each lesson ends by adding its words to your deck.</li>
          <li><b>New words</b>: the remaining core words in frequency order. Start with 15 a day; change it under Preferences.</li>
          <li><b>Review</b>: flashcards on a spaced schedule (FSRS). Be honest with the buttons; the schedule depends on it.</li>
          <li><b>Quran</b>: all 114 surahs with word-by-word meanings in English and Turkish, and translations in English, Turkish (Diyanet) and German (Bubenheim). Tap any word for its root, grammar and Turkish cousins.</li>
          <li><b>Practice</b>: endless drills made from real verses: meanings, roots, tenses, pronouns, verb forms.</li>
        </ul>
        ${tip('Bismillah. Ten focused minutes every day beat two hours once a week.', 'Start')}` },
    ],
  },
  {
    id: 'kinds', unit: 1, title: 'Three kinds of words', ar: 'اِسْمٌ · فِعْلٌ · حَرْفٌ', mins: 10,
    goal: 'Sort every word into noun, verb or particle, and learn the five most common prepositions.',
    words: [1, 3, 8, 16, 24, 6, 10, 23, 25, 38],
    steps: [
      { teach: `
        <h2>Ism, fiʿl, ḥarf</h2>
        <p>Arabic grammar (<i>naḥw</i>, Turkish <i>nahiv</i>) sorts every word into one of three kinds. You may know the Turkish names from school or the mosque:</p>
        ${table(['Kind', 'Türkçe', 'What it does', 'Examples'], [
          [A('اِسْم') + ' noun', 'isim', 'names a thing, person or quality (also adjectives, pronouns)', A('اللّٰه · كِتَاب · رَحِيم · هُوَ')],
          [A('فِعْل') + ' verb', 'fiil', 'an action in time', A('قَالَ · يَقُولُ · قُلْ')],
          [A('حَرْف') + ' particle', 'harf', 'a small word that only means something together with others', A('مِنْ · فِي · عَلَى · لَا')],
        ])}` },
      { teach: `
        <h2>How to tell them apart</h2>
        <p><b>A noun</b> can take ${A('الـ')} "the" (${A('الْكِتَابُ')}), can end in tanwīn (${A('كِتَابٌ')}), and can come after a preposition (${A('فِي الْأَرْضِ')} "in the earth").</p>
        <p><b>A verb</b> never takes ${A('الـ')} or tanwīn. Past verbs have fixed endings (${A('قَالَ · قَالُوا · قُلْتُ')}); present verbs start with one of the letters ${A('أ ن ي ت')} (${A('يَقُولُ · نَعْبُدُ')}).</p>
        <p><b>A particle</b> is everything else: short, unchanging words.</p>
        ${tip('Look at 1:2 below: الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ has four nouns, one particle (لِـ) — and no verb at all. Arabic sentences do not need one.')}
        ${Q('1:2')}` },
      { quiz: 'Which one is a verb?', o: ['يَعْلَمُ', 'عِلْمٌ', 'عَلِيمٌ', 'الْعَالَمِينَ'], a: 0, ar: true,
        why: 'يَعْلَمُ starts with ي — a present-tense prefix — and has no ال or tanwīn. The others are nouns.' },
      { quiz: 'Which one is a particle?', o: ['فِي', 'يَوْمٌ', 'قَالَ', 'الْأَرْضُ'], a: 0, ar: true, why: 'فِي "in" is a preposition — a particle.' },
      { quiz: `How do you know ${A('الْأَرْضِ')} is a noun?`, o: ['It has الـ', 'It starts with أ', 'It ends in ض', 'It has four letters'], a: 0,
        why: 'Only nouns can take الـ "the".' },
      { teach: `
        <h2>Five little words, everywhere</h2>
        <p>These five prepositions alone make up almost a tenth of the Quran. Learn them today and you will see them in every verse.</p>
        ${table(['Arabic', 'Meaning', 'Example', ''], [
          [A('مِنْ'), 'from; of; some of', A('مِنَ السَّمَاءِ'), 'from the sky'],
          [A('فِي'), 'in', A('فِي الْأَرْضِ'), 'in the earth'],
          [A('عَلَى'), 'on, over; against', A('عَلَى كُلِّ شَيْءٍ'), 'over everything'],
          [A('إِلَى'), 'to, toward', A('إِلَى اللّٰهِ'), 'to Allah'],
          [A('عَنْ'), 'from, away from; about', A('عَنِ النَّارِ'), 'away from the Fire'],
        ])}
        ${key('After a preposition, a noun ends in <b>-i</b> (' + A('ـِ') + '). You will see why in Lesson 7.')}` },
      { quiz: `${Q('112:1')} Which word is the verb?`, o: ['قُلْ', 'هُوَ', 'اللّٰهُ', 'أَحَدٌ'], a: 0, ar: true,
        why: 'قُلْ "Say!" is a command — a verb. هُوَ is a pronoun (a noun), اللّٰه and أَحَد are nouns.' },
      { words: true },
    ],
  },
  {
    id: 'definite', unit: 1, title: '"The" and "a": al- and tanwīn', ar: 'الْمَعْرِفَةُ وَالنَّكِرَةُ', mins: 9,
    goal: 'Read definiteness at a glance: الـ means "the", tanwīn means "a".',
    words: [4796, 52, 28, 29, 84, 81, 37, 50, 65, 41],
    steps: [
      { teach: `
        <h2>Definite and indefinite</h2>
        <p>${A('الـ')} at the front means <b>"the"</b>: ${A('الْكِتَابُ')} the book. Tanwīn (doubled vowel, ${A('ـٌ ـٍ ـً')}) at the end means <b>"a"</b>: ${A('كِتَابٌ')} a book. A noun has one or the other, never both.</p>
        ${table(['Indefinite (nakira)', '', 'Definite (maʿrifa)', ''], [
          [A('كِتَابٌ'), 'a book', A('الْكِتَابُ'), 'the book'],
          [A('نَارٌ'), 'a fire', A('النَّارُ'), 'the Fire'],
          [A('جَنَّةٌ'), 'a garden', A('الْجَنَّةُ'), 'Paradise (the Garden)'],
          [A('هُدًى'), 'a guidance', A('الْهُدَى'), 'the guidance'],
        ])}
        ${tr('Turkish grammar uses the Arabic terms: <i>marife</i> (definite) and <i>nekre</i> (indefinite).')}
        <p>Names are definite by themselves: ${A('اللّٰه')}, ${A('مُوسَى')}, ${A('مَكَّة')} never take tanwīn or ${A('الـ')}.</p>` },
      { teach: `
        <h2>What you see in the Uthmani script</h2>
        <p>The mushaf writes the article as ${A('ٱلْـ')} with a small sign on the alif (<i>alif waṣla</i>): the a- is only pronounced at the start of speech. In ${A('بِسْمِ ٱللَّهِ')} you say <i>bismi-llāh</i>.</p>
        <p>Before "sun letters" the ل is silent and the next letter doubles: ${A('الشَّمْسُ')} <i>ash-shams</i>, ${A('النَّاسُ')} <i>an-nās</i>. The meaning stays "the".</p>
        <p>From 2:2 — ${Q('2:2', '2')} "the Book" (definite) and ${Q('2:2', '6')} "a guidance" (indefinite):</p>
        ${Q('2:2')}` },
      { quiz: `${A('عَذَابٌ أَلِيمٌ')} means…`, o: ['a painful punishment', 'the painful punishment', 'the punishment is painful', 'painful punishments'], a: 0,
        why: 'Both words have tanwīn, so both are indefinite: "a painful punishment".' },
      { quiz: 'Which word is definite?', o: ['النَّاسُ', 'نَاسًا', 'آيَةٌ', 'شَيْءٍ'], a: 0, ar: true, why: 'النَّاسُ has الـ.' },
      { quiz: `Why does ${A('اللّٰه')} never take tanwīn?`, o: ['It is a proper name, already definite', 'It is a verb', 'It is plural', 'Tanwīn is only for feminine words'], a: 0,
        why: 'Proper names are definite by themselves.' },
      { words: true },
    ],
  },
  {
    id: 'prefixes', unit: 1, title: 'Little prefixes: wa, fa, bi, li, ka', ar: 'حُرُوفٌ مُتَّصِلَةٌ', mins: 9,
    goal: 'Split long-looking words into their parts.',
    words: [4795, 4798, 4799, 4797, 4803],
    steps: [
      { teach: `
        <h2>One-letter words that stick to the next word</h2>
        ${table(['Prefix', 'Meaning', 'Example', ''], [
          [A('وَ'), 'and (also: "by…!" in oaths)', A('وَالْأَرْضِ'), 'and the earth'],
          [A('فَ'), 'so, then, and so', A('فَسَبِّحْ'), 'so glorify!'],
          [A('بِـ'), 'with, by, in', A('بِالْحَقِّ'), 'with the truth'],
          [A('لِـ'), 'for, to; belongs to', A('لِلنَّاسِ'), 'for the people'],
          [A('كَـ'), 'like, as', A('كَمِثْلِهِ'), 'like Him'],
        ])}
        <p>Once you see them, long words fall apart. In 2:4, ${Q('2:4', '10')} is ${A('وَ + بِ + الْ + آخِرَةِ')} "and in the Hereafter".</p>
        ${tr('Turkish <i>ve</i> is this very ' + A('وَ') + '. <i>Bismillah</i> = ' + A('بِـ') + ' + ' + A('اسْم') + ' + ' + A('اللّٰه') + '. <i>Bilhassa</i> and <i>bizzat</i> also start with ' + A('بِـ') + '.')}` },
      { teach: `
        <h2>Small spelling changes</h2>
        <ul>
          <li>${A('لِـ')} + ${A('الـ')} drops the alif: ${A('لِلْمُتَّقِينَ')} "for the God-conscious" (2:2).</li>
          <li>${A('لِـ')} + ${A('اللّٰه')} → ${A('لِلّٰهِ')} "for Allah".</li>
          <li>${A('لِـ')} before a pronoun becomes ${A('لَـ')}: ${A('لَهُ')} for him, ${A('لَكُمْ')} for you.</li>
          <li>${A('بِـ')}, ${A('لِـ')} and ${A('كَـ')} are prepositions, so the next noun ends in -i: ${A('بِالْحَقِّ')}.</li>
        </ul>
        ${Q('103:1')}
        <p>Here ${A('وَ')} swears an oath: "By time!" — the most famous opening oath in the Quran.</p>` },
      { quiz: `Split ${A('وَلِلّٰهِ')}:`, o: ['and + for + Allah', 'and + the + Allah', 'so + for + Allah', 'like + for + Allah'], a: 0, why: 'وَ "and" + لِـ "for" + اللّٰه.' },
      { quiz: `In ${A('فَسَبِّحْ بِحَمْدِ رَبِّكَ')} (110:3), what does ${A('فَـ')} add?`, o: ['"so / then"', '"and not"', '"like"', '"the"'], a: 0, why: 'فَـ links a result: "so glorify the praise of your Lord".' },
      { quiz: `${A('بِالْحَقِّ')} means…`, o: ['with the truth', 'the truth', 'for the truth', 'like the truth'], a: 0, why: 'بِـ "with" + الْحَقّ "the truth".' },
      { verse: '103:1', note: 'Tap the word to see it split into three parts: وَ + الْ + عَصْر.' },
      { words: true },
    ],
  },
  {
    id: 'gender', unit: 1, title: 'Masculine and feminine', ar: 'الْمُذَكَّرُ وَالْمُؤَنَّثُ', mins: 10,
    goal: 'Recognize feminine nouns and see adjectives and verbs agree with them.',
    words: [58, 388, 157, 191, 233, 273, 39, 341, 398, 410],
    steps: [
      { teach: `
        <h2>Every noun has a gender</h2>
        <p>Feminine nouns usually show it:</p>
        ${table(['Sign', 'Examples'], [
          ['ending ' + A('ـة') + ' (tāʾ marbūṭa)', A('رَحْمَة · جَنَّة · آيَة · نِعْمَة · كَلِمَة')],
          ['ending ' + A('ـَى') + ' or ' + A('ـَاء'), A('دُنْيَا · أُنْثَى · بُشْرَى')],
          ['female by nature', A('أُمّ · امْرَأَة · بِنْت')],
          ['feminine by usage (learn them)', A('نَفْس · أَرْض · شَمْس · نَار · رِيح · دَار')],
        ])}
        ${tr('<i>Müzekker</i> (masculine) and <i>müennes</i> (feminine) are the Arabic words ' + A('مُذَكَّر') + ' and ' + A('مُؤَنَّث') + '.')}` },
      { teach: `
        <h2>Making a feminine</h2>
        <p>Add ${A('ـَة')} to a masculine word for people or qualities: ${A('مُؤْمِن')} believer → ${A('مُؤْمِنَة')} believing woman; ${A('صَالِح')} → ${A('صَالِحَة')}.</p>
        <p>Adjectives and verbs follow the noun's gender. In 3:185 ${Q('3:185', '1-4')} "every soul will taste death", the word ${A('ذَائِقَة')} is feminine because ${A('نَفْس')} is feminine.</p>
        <p>The same in verbs: ${A('قَالَ')} he said, ${A('قَالَتْ')} she said.</p>` },
      { quiz: 'Which noun is feminine?', o: ['جَنَّة', 'كِتَاب', 'قَلْب', 'يَوْم'], a: 0, ar: true, why: 'The ة ending marks it.' },
      { quiz: '"a believing woman"', o: ['مُؤْمِنَةٌ', 'مُؤْمِنٌ', 'مُؤْمِنُونَ', 'إِيمَانٌ'], a: 0, ar: true, why: 'مُؤْمِن + ة.' },
      { quiz: `Why is it ${A('ذَائِقَةُ')} (with ة) in ${A('كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ')}?`, o: ['نَفْس is feminine', 'الْمَوْت is feminine', 'It is plural', 'It is a verb'], a: 0,
        why: 'The describing word agrees with نَفْس, which is feminine.' },
      { verse: '89:27', note: 'Spoken to the soul at death: every word is feminine — ' + A('أَيَّتُهَا') + ', ' + A('النَّفْسُ') + ', ' + A('الْمُطْمَئِنَّةُ') + '.' },
      { verse: '89:28', note: 'The command ' + A('ارْجِعِي') + ' and the ' + A('ـكِ') + ' in ' + A('رَبِّكِ') + ' are feminine because they address the soul.' },
      { words: true },
    ],
  },
  {
    id: 'number', unit: 1, title: 'One, two, many', ar: 'الْمُفْرَدُ وَالْمُثَنَّى وَالْجَمْعُ', mins: 12,
    goal: 'Recognize the sound plurals, the dual, and the most common broken plurals.',
    words: [77, 95, 128, 93, 36, 153, 383, 197, 182, 129],
    steps: [
      { teach: `
        <h2>Singular, dual, plural</h2>
        ${table(['', 'Ending', 'Example'], [
          ['Sound masculine plural (people)', A('ـُونَ') + ' / ' + A('ـِينَ'), A('مُؤْمِنُونَ · الْمُؤْمِنِينَ')],
          ['Sound feminine plural', A('ـَات'), A('آيَات · صَالِحَات · سَمٰوَات')],
          ['Dual (two)', A('ـَانِ') + ' / ' + A('ـَيْنِ'), A('جَنَّتَانِ · يَدَيْهِ')],
        ])}
        <p>${A('ـُونَ')} is used for the subject; ${A('ـِينَ')} everywhere else — in ${A('رَبِّ الْعَالَمِينَ')} it is ${A('ـِينَ')}.</p>
        ${tr('Turkish keeps these plurals in set phrases: <i>Emîrü\'l-mü\'minîn</i>, <i>âlemîn</i>, <i>salihat</i>, <i>hayvanat</i>, <i>edebiyat</i>.')}` },
      { teach: `
        <h2>Broken plurals</h2>
        <p>Most plurals change the inside of the word. A few patterns cover the majority:</p>
        ${table(['Pattern', 'Singular → plural', 'Meaning'], [
          [A('فُعُول'), A('قَلْب ← قُلُوب · بَيْت ← بُيُوت'), 'hearts · houses'],
          [A('أَفْعَال'), A('مَال ← أَمْوَال · عَمَل ← أَعْمَال'), 'wealth · deeds'],
          [A('فُعُل'), A('رَسُول ← رُسُل · كِتَاب ← كُتُب'), 'messengers · books'],
          [A('فِعَال'), A('عَبْد ← عِبَاد · رَجُل ← رِجَال'), 'servants · men'],
          [A('أَفْعِلَاء'), A('نَبِيّ ← أَنْبِيَاء · وَلِيّ ← أَوْلِيَاء'), 'prophets · allies'],
        ])}
        ${tr('Ottoman Turkish used these plurals: <i>ulemâ</i>, <i>evliyâ</i>, <i>enbiyâ</i>, <i>emvâl</i>, <i>eşyâ</i> (plural of ' + A('شَيْء') + ').')}
        ${tip('Do not try to predict broken plurals — learn them with the word. Each word card shows its plural.')}` },
      { teach: `
        <h2>A rule you will use daily</h2>
        <p>Plurals of <b>things</b> (not people) are treated as <b>feminine singular</b>. So "those are the verses" uses the feminine singular ${A('تِلْكَ')}: ${A('تِلْكَ آيَاتُ الْكِتَابِ')}.</p>
        <p>In 2:5, ${Q('2:5', '8')} "the successful ones" is a sound masculine plural:</p>
        ${Q('2:5')}` },
      { quiz: '"the believers" as the subject of a sentence:', o: ['الْمُؤْمِنُونَ', 'الْمُؤْمِنِينَ', 'الْمُؤْمِنَاتُ', 'مُؤْمِنٌ'], a: 0, ar: true, why: 'The subject takes ـُونَ.' },
      { quiz: `${A('أَمْوَال')} is the plural of…`, o: ['مَال wealth', 'أُمّ mother', 'مَوْت death', 'أَمْر matter'], a: 0, why: 'Pattern أَفْعَال: م و ل → أَمْوَال.' },
      { quiz: 'Which word is dual?', o: ['جَنَّتَانِ', 'جَنَّاتٌ', 'جَنَّةٌ', 'الْجَنَّةُ'], a: 0, ar: true, why: 'ـَانِ marks two: "two gardens".' },
      { words: true },
    ],
  },
  {
    id: 'cases', unit: 1, title: 'The three case endings', ar: 'الْإِعْرَابُ', mins: 12,
    goal: 'Read the last vowel of a noun as a sign of its job in the sentence.',
    words: [268, 159, 119, 255, 316],
    steps: [
      { teach: `
        <h2>-u, -a, -i</h2>
        <p>The last vowel of a noun shows what it does in the sentence. This is <i>iʿrāb</i> (Turkish <i>i'râb</i>):</p>
        ${table(['Case', 'Ending', 'Main uses', 'Example'], [
          ['nominative — <i>marfūʿ</i> (merfû)', A('ـُ  ـٌ'), 'subject; topic and predicate of a nominal sentence', A('الْحَمْدُ')],
          ['accusative — <i>manṣūb</i> (mansûb)', A('ـَ  ـً'), 'object; after إِنَّ; adverbs', A('إِنَّ اللّٰهَ')],
          ['genitive — <i>majrūr</i> (mecrûr)', A('ـِ  ـٍ'), 'after a preposition; second noun of "X of Y"', A('لِلّٰهِ')],
        ])}
        ${tr('Turkish marks roles with suffixes (-i, -e, -in); Arabic marks them with the final vowel. Like Turkish, that lets the word order move for emphasis.')}` },
      { teach: `
        <h2>Plurals and duals change too</h2>
        ${table(['', 'nominative', 'accusative / genitive'], [
          ['sound masc. plural', A('مُؤْمِنُونَ'), A('مُؤْمِنِينَ')],
          ['dual', A('جَنَّتَانِ'), A('جَنَّتَيْنِ')],
          ['sound fem. plural', A('آيَاتٌ'), A('آيَاتٍ') + ' (only -i, never -a)'],
        ])}
        <p>Read 1:2 again: ${A('الْحَمْدُ')} ends in -u (it is the topic). ${A('لِلّٰهِ')} ends in -i (after ${A('لِـ')}). ${A('رَبِّ')} ends in -i because it describes ${A('اللّٰه')} and copies its case. ${A('الْعَالَمِينَ')} is genitive: the second noun of "Lord of the worlds".</p>
        ${Q('1:2')}` },
      { quiz: `Why is it ${A('اللّٰهَ')} (-a) in ${A('إِنَّ اللّٰهَ غَفُورٌ')}?`, o: ['The noun after إِنَّ takes -a', 'It is a verb', 'It is plural', 'It follows a preposition'], a: 0,
        why: 'إِنَّ makes the next noun manṣūb.' },
      { quiz: `Why does ${A('الْأَرْضِ')} end in -i in ${A('فِي الْأَرْضِ')}?`, o: ['It follows a preposition', 'It is the subject', 'It is feminine', 'It is definite'], a: 0, why: 'فِي is a preposition → genitive.' },
      { quiz: 'Which ending marks the subject?', o: ['ـُ', 'ـَ', 'ـِ', 'ـْ'], a: 0, ar: true, why: 'The nominative -u.' },
      { quiz: `${A('الصِّرَاطَ الْمُسْتَقِيمَ')} in 1:6 ends in -a. Why?`, o: ['It is the object of "guide us"', 'It follows a preposition', 'It is the subject', 'It is plural'], a: 0,
        why: 'اهْدِنَا "guide us" — the path is what we ask to be guided to: an object, so -a.' },
      { verse: '1:6' },
      { verse: '1:7', note: A('غَيْرِ') + ' and ' + A('الضَّالِّينَ') + ' end in -i: they describe ' + A('الَّذِينَ') + ', which follows the -i chain of ' + A('صِرَاطَ الَّذِينَ') + '.' },
      { words: true },
    ],
  },
  {
    id: 'prepositions', unit: 1, title: 'Prepositions and place words', ar: 'حُرُوفُ الْجَرِّ وَالظُّرُوفُ', mins: 10,
    goal: 'Know the words for before, after, with, under, above, between — and the phrases they make.',
    words: [61, 47, 51, 60, 85, 226, 280, 87, 72, 461, 441, 562, 465, 539],
    steps: [
      { teach: `
        <h2>Two families</h2>
        <p>True prepositions: ${A('مِنْ · إِلَى · عَنْ · عَلَى · فِي · بِـ · لِـ · كَـ · حَتَّى')}. Place and time nouns used like prepositions (<i>ẓarf</i>, Turkish <i>zarf</i>):</p>
        ${table(['Arabic', 'Meaning', 'Arabic', 'Meaning'], [
          [A('عِنْدَ'), 'at, with', A('بَيْنَ'), 'between'],
          [A('قَبْلَ'), 'before', A('بَعْدَ'), 'after'],
          [A('فَوْقَ'), 'above', A('تَحْتَ'), 'under'],
          [A('مَعَ'), 'with (together)', A('دُونَ'), 'besides; below'],
          [A('خَلْفَ'), 'behind', A('وَرَاءَ'), 'behind, beyond'],
          [A('حَوْلَ'), 'around', A('لَدَى · لَدُنْ'), 'with, from (the presence of)'],
        ])}
        <p>Both families put the next noun in the genitive (-i).</p>` },
      { teach: `
        <h2>Phrases you will meet constantly</h2>
        ${table(['Phrase', 'Meaning'], [
          [A('مِنْ قَبْلُ'), 'before (that)'], [A('مِنْ بَعْدِ'), 'after'], [A('مِنْ دُونِ اللّٰهِ'), 'besides Allah, instead of Allah'],
          [A('مِنْ عِنْدِ اللّٰهِ'), 'from Allah'], [A('مِنْ تَحْتِهَا'), 'beneath it (rivers of Paradise)'], [A('بَيْنَ يَدَيْهِ'), 'before it (lit. between its two hands)'],
        ])}
        ${tr('<i>Fevkalâde</i> = ' + A('فَوْقَ الْعَادَة') + ' "above the usual". <i>Tahtelbahir</i> (submarine) = ' + A('تَحْتَ الْبَحْر') + ' "under the sea". <i>Beynelmilel</i> = ' + A('بَيْنَ الْمِلَل') + ' "between the nations". <i>İndî</i> (subjective) = ' + A('عِنْدِي') + ' "with me, in my view".')}` },
      { quiz: `${A('تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ')} — rivers flow ___ it.`, o: ['beneath', 'above', 'around', 'behind'], a: 0, why: 'تَحْتَ = under, beneath.' },
      { quiz: `${A('مِنْ دُونِ اللّٰهِ')} means…`, o: ['besides Allah', 'after Allah', 'with Allah', 'from Allah'], a: 0, why: 'دُونَ = other than, besides.' },
      { quiz: 'Turkish <i>fevkalade</i> comes from…', o: ['فَوْقَ above', 'فِي in', 'فَضْل bounty', 'فَتْح opening'], a: 0, ar: false, why: 'فَوْقَ الْعَادَة "above the usual".' },
      { verse: '2:21', note: A('مِنْ قَبْلِكُمْ') + ' "before you": preposition + place noun + pronoun.' },
      { words: true },
    ],
  },
];
