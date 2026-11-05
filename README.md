# Lisan — Quranic Arabic · لِسَان

**Lisan** is a complete course for understanding the Quran in Arabic, built for someone who can already read Arabic script and wants to learn *fast*. It is tuned for a Turkish speaker who also knows German and English.

> بِلِسَانٍ عَرَبِيٍّ مُبِينٍ — *"in a clear Arabic tongue"* (26:195)

## Why it works

- **Frequency first.** The Quran has 77,429 words, but a few hundred carry most of the text. Lisan teaches **704 core words** in frequency order, and together they make up **84.8% of all the words in the Quran**. The first 100 alone cover 59%.
- **Your Turkish head start.** Every word comes with its English, Turkish and German meanings, *plus the Turkish words built on the same Arabic root*: قَلْب → *kalp, inkılap*; جَمَعَ → *cami, cuma, cemaat, mecmua*; وَضَعَ → *vaziyet, mevzu, mütevazı*. Grammar terms are also given in their Turkish (Ottoman-tradition) form: *mübtedâ, haber, fâil, mef'ûl, izâfet, mâzi, muzâri*.
- **Grammar that is actually in the Quran.** 34 short lessons in 7 units take you from roots and case endings to the ten verb forms, weak verbs and conditionals. Every example comes from real verses, which are pulled from the data so the text is always exact. The course ends with al-Fātiḥa, Āyat al-Kursī and the last surahs, word by word.
- **Spaced repetition.** Flashcards are scheduled with the FSRS-4.5 memory model, so each word comes back just before you would forget it.
- **The whole Quran, word by word.** All 114 surahs with word-by-word English and Turkish glosses and full translations: Saheeh International, Diyanet (Türkçe) and Bubenheim & Elyas (Deutsch). Tap any word to see its parts, root, form, case and Turkish cousins, and add it to your words (or take it out again) right there. Words you know turn green, so you can watch the Quran fill in.
- **Listen while you read.** Play a whole surah (it starts with the basmala) or a single verse, pause and resume where you were, stop, skip, or repeat one verse until it sticks. The verse being recited is highlighted and followed on screen, and phones show the controls on the lock screen.
- **Endless practice from real verses.** Drills on meaning in context, roots, who is speaking, tense, attached pronouns, verb forms and case.

## Daily routine (20–30 minutes)

1. **Review** your due cards (Home shows the number).
2. **One lesson** from the Course, until all 34 are done.
3. **New words**: 15 a day by default. At that pace you know all core words in about 7 weeks.
4. **Read** a little in the Quran tab, with known-word colors on. Each surah shows how much of it you already know.

## Open the app

**Live website:** [Open Lisan](https://lunarbaho.github.io/lisan-quranic-arabic/).

**Claude artifact version:** when packaged as a Claude artifact, progress can sync with your Claude account and **Hoca**, the AI teacher, can answer questions in English, Türkçe or Deutsch. These Claude-specific features are separate from the GitHub Pages website. Recitation audio is available on the website.

**As a website / phone app (GitHub Pages):**

1. Open [Lisan](https://lunarbaho.github.io/lisan-quranic-arabic/).
2. On your phone, choose *Add to Home Screen* to use Lisan like an installed app. Visited content is cached for offline use.
3. Updates pushed to `main` automatically publish the `app/` folder through `.github/workflows/pages.yml`. For a new copy of this repository, set **Settings → Pages → Build and deployment → Source: GitHub Actions** once.

The website version adds verse and word recitation (Mishary Alafasy, al-Husary, al-Minshawi, Abdul Basit). Its progress is stored in the browser. Use *Preferences → Copy backup / Restore* to move it between devices. A new release downloads in the background and is used from the next change of screen, so a lesson or review is never interrupted.

**Locally:**

```bash
python3 -m http.server 8000 -d app
```

Then open <http://localhost:8000>. The app needs a web server; opening `index.html` straight from disk blocks its data files.

## Project layout

```
app/                      the app (static files, no build step)
  index.html  sw.js  manifest.webmanifest
  css/app.css
  js/main.js              routing and the app shell
  js/store.js             progress, daily log, sync with the claude.ai db
  js/audio.js             the recitation player (verse sessions, pause/resume, repeat, word clips)
  js/srs.js               FSRS-4.5 scheduler
  js/morph.js             turns corpus tags into readable grammar (EN + Arabic + Turkish terms)
  js/content/             the 34 lessons (u1–u4.js) and the grammar reference
  js/views/               one module per screen
  data/                   generated: vocab, lemmas, surahs, 114 surah files
tools/
  fetch_sources.py        downloads the raw sources into tools/.cache
  build_data.py           builds app/data from the sources + the curated vocabulary
  vocab/*.txt             the curated vocabulary (meanings, Turkish cognates, notes)
  build_artifact.py       packages the app as a single claude.ai page
tests/                    Playwright smoke, learner-flow, interaction, layout-quality and artifact tests
```

### Rebuilding the data

```bash
python3 tools/fetch_sources.py   # once, about 5 minutes
python3 tools/build_data.py
```

The vocabulary lives in `tools/vocab/*.txt`, one word per line. Each line names the corpus lemma by frequency rank and checks it against the lemma's consonants. If a rank ever shifts, the build stops with a clear error, so a meaning can never end up on the wrong word.

### Tests

```bash
python3 -m http.server 8000 -d app &
node tests/precache.mjs                              # the service worker caches every module and core data file
node tests/smoke.mjs http://localhost:8000/          # every screen, phone + desktop, no console errors
node tests/flow.mjs  http://localhost:8000/          # lesson → new words → review → Quran word sheet
node tests/interactions.mjs http://localhost:8000/   # player, undoable adds, review undo, lesson resume, keys
node tests/layout.mjs http://localhost:8000/         # no text overlaps, is cut off or scrolls sideways
```

`interactions.mjs` answers recitation requests with a short silent clip, so it needs no network. It checks play, pause and resume at the same verse, stop clearing the highlight, a single verse ending by itself, repeat and skip, a word clip pausing the verse, adding and removing words with undo, undoing a review grade, that a word check left half-way can never answer for another screen, and that a lesson picks up where it was left.

The artifact test stubs the claude.ai runtime itself:

```bash
python3 tools/build_artifact.py build/artifact
python3 -m http.server 8766 -d build/artifact &
node tests/artifact.mjs http://localhost:8766/
```

`layout.mjs` is the quality check for typography. It opens every screen, every lesson step, the drills, flashcards and the word sheet on five device profiles: phone, small phone, tablet and desktop; English, Türkçe and Deutsch; Arabic size M to XL, with and without word meanings; light and dark. On each screen it measures the real ink of every word. For Arabic it uses the glyph outlines, because harakat and waqf signs in the Quran font reach far outside the CSS line box. It fails if any two pieces of text touch, if text is clipped, or if a page scrolls sideways. A full run takes about 10 minutes. Add `--quick` for a shorter pass (about 5 minutes), or `--only phone` to check a single profile.

## Sources and licenses

- **Morphology** (root, lemma and grammar of every word): [Quranic Arabic Corpus](https://corpus.quran.com) v0.4 by Kais Dukes, GNU GPL, with the corrections of [mustafa0x/quran-morphology](https://github.com/mustafa0x/quran-morphology).
- **Uthmani text, word-by-word glosses (EN/TR), translations** (Saheeh International; Diyanet İşleri Başkanlığı; Frank Bubenheim & Nadeem Elyas): via the [Quran.com](https://quran.com) API.
- **Recitation**: [EveryAyah.com](https://everyayah.com) (verses) and Quran.com (single words).
- **Fonts**: Amiri Quran, Scheherazade New and Alegreya, all under the SIL Open Font License, loaded from Google Fonts.
- **Course, curated vocabulary, Turkish cognates and German glosses**: written for Lisan.

The generated files in `app/data` contain material from these sources and keep their licenses. This is a personal, non-commercial learning tool. Word-by-word glosses are learning aids; for the meaning of a verse, rely on full translations and on scholars.
