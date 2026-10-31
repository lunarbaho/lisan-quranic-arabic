#!/usr/bin/env python3
"""Build the app's data files (app/data/*) from the cached sources.

    python3 tools/fetch_sources.py   # once: downloads into tools/.cache
    python3 tools/build_data.py      # writes app/data/

Outputs
  quran/NNN.json   one file per surah: words with morphology + glosses,
                   verse translations (en / tr / de)
  lemmas.json      every lemma in the Quran with frequency, root, auto glosses
  feats.json       dictionary of morphological feature strings
  vocab.json       the curated course vocabulary (tools/vocab/*.txt)
  surahs.json      surah names and metadata
"""
import collections
import glob
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, '.cache')
OUT = os.path.join(ROOT, 'app', 'data')
sys.path.insert(0, HERE)
from qdata import parse_morph, stem_index, lemma_key, load_qcom  # noqa: E402

DE_SURAH_NAMES = ['Die Eröffnende', 'Die Kuh', 'Die Sippe ʿImrans', 'Die Frauen', 'Der Tisch', 'Das Vieh', 'Die Höhen', 'Die Beute', 'Die Reue', 'Jonas', 'Hud', 'Josef', 'Der Donner', 'Abraham', 'Al-Hidschr', 'Die Bienen', 'Die Nachtreise', 'Die Höhle', 'Maria', 'Ta-Ha', 'Die Propheten', 'Die Pilgerfahrt', 'Die Gläubigen', 'Das Licht', 'Die Unterscheidung', 'Die Dichter', 'Die Ameisen', 'Die Geschichte', 'Die Spinne', 'Die Römer', 'Luqman', 'Die Niederwerfung', 'Die Gruppierungen', 'Saba', 'Der Erschaffer', 'Ya-Sin', 'Die sich Reihenden', 'Sad', 'Die Scharen', 'Der Vergebende', 'Ausführlich dargelegt', 'Die Beratung', 'Der Goldschmuck', 'Der Rauch', 'Die Kniende', 'Die Sanddünen', 'Muhammad', 'Der Sieg', 'Die Gemächer', 'Qaf', 'Die Aufwirbelnden', 'Der Berg', 'Der Stern', 'Der Mond', 'Der Allerbarmer', 'Das eintreffende Ereignis', 'Das Eisen', 'Der Streit', 'Die Versammlung', 'Die Geprüfte', 'Die Reihe', 'Der Freitag', 'Die Heuchler', 'Die Übervorteilung', 'Die Scheidung', 'Das Verbot', 'Die Herrschaft', 'Das Schreibrohr', 'Die fällige Stunde', 'Die Aufstiegswege', 'Noah', 'Die Dschinn', 'Der Eingehüllte', 'Der Zugedeckte', 'Die Auferstehung', 'Der Mensch', 'Die Entsandten', 'Die Kunde', 'Die Entreißenden', 'Er runzelte die Stirn', 'Das Umschlingen', 'Das Zerbrechen', 'Die das Maß Kürzenden', 'Das Zerreißen', 'Die Türme', 'Der Pochende', 'Der Höchste', 'Die Überdeckende', 'Die Morgendämmerung', 'Die Ortschaft', 'Die Sonne', 'Die Nacht', 'Der Vormittag', 'Das Weiten', 'Der Feigenbaum', 'Das Anhängsel', 'Die Bestimmung', 'Der klare Beweis', 'Das Beben', 'Die Rennenden', 'Das Verhängnis', 'Die Vermehrung', 'Das Zeitalter', 'Der Stichler', 'Der Elefant', 'Quraisch', 'Die Hilfeleistung', 'Die Fülle', 'Die Ungläubigen', 'Die Hilfe', 'Die Palmfasern', 'Die Aufrichtigkeit', 'Das Frühlicht', 'Die Menschen']

DIACRITICS = re.compile('[ؐ-ًؚ-ٰٟۖ-ۭـ]')
SYNTH_AR = {
    'DEM:near:MS': 'هٰذَا', 'DEM:near:FS': 'هٰذِهِ', 'DEM:near:P': 'هٰؤُلَاءِ', 'DEM:near:D': 'هٰذَانِ',
    'DEM:far:MS': 'ذٰلِكَ', 'DEM:far:FS': 'تِلْكَ', 'DEM:far:P': 'أُولٰئِكَ', 'DEM:far:D': 'ذَانِكَ',
    'PRON:1S': 'أَنَا', 'PRON:1P': 'نَحْنُ', 'PRON:2MS': 'أَنْتَ', 'PRON:2FS': 'أَنْتِ',
    'PRON:2D': 'أَنْتُمَا', 'PRON:2MP': 'أَنْتُمْ', 'PRON:2FP': 'أَنْتُنَّ', 'PRON:3MS': 'هُوَ',
    'PRON:3FS': 'هِيَ', 'PRON:3D': 'هُمَا', 'PRON:3MP': 'هُمْ', 'PRON:3FP': 'هُنَّ',
}


def skeleton(s):
    s = DIACRITICS.sub('', s)
    for a, b in (('أ', 'ا'), ('إ', 'ا'), ('آ', 'ا'), ('ٱ', 'ا'), ('ى', 'ي'), ('ؤ', 'و'),
                 ('ئ', 'ي'), ('ة', 'ه'), ('ء', ''), ('ۥ', ''), ('ۦ', '')):
        s = s.replace(a, b)
    return s.strip()


def clean_translation(t):
    t = re.sub(r'<sup[^>]*>.*?</sup>', '', t or '')
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t)
    return re.sub(r'\s+', ' ', t).strip()


def write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def main():
    morph = parse_morph(os.path.join(CACHE, 'quran-morphology.txt'))
    qw, qv = load_qcom(os.path.join(CACHE, 'qcom'))
    assert len(morph) == len(qw), (len(morph), len(qw))

    # ---- lemma statistics ------------------------------------------------
    stem_c, all_c = collections.Counter(), collections.Counter()
    gl_en = collections.defaultdict(collections.Counter)
    gl_tr = collections.defaultdict(collections.Counter)
    occurrences = collections.defaultdict(list)       # key -> [(s, v, w)] as stem
    any_occ = collections.defaultdict(list)           # key -> [(s, v, w)] anywhere
    seg_keys = {}
    for loc, segs in morph.items():
        si = stem_index(segs)
        keys = [lemma_key(sg, segs) for sg in segs]
        seg_keys[loc] = (si, keys)
        for i, k in enumerate(keys):
            if not k:
                continue
            all_c[k] += 1
            if len(any_occ[k]) < 4000:
                any_occ[k].append(loc)
            if i == si:
                stem_c[k] += 1
                occurrences[k].append(loc)
                q = qw[loc]
                gl_en[k][q.get('en', '')] += 1
                gl_tr[k][q.get('tr', '')] += 1
    order = sorted(set(all_c), key=lambda k: (-stem_c[k], -all_c[k], k))
    lemma_id = {k: i for i, k in enumerate(order)}
    total_words = len(morph)

    with open(os.path.join(CACHE, 'freq_report.tsv'), 'w', encoding='utf-8') as f:
        cum = 0
        for i, k in enumerate(order, 1):
            cum += stem_c[k]
            f.write(f"{i}\t{k}\t{stem_c[k]}\t{all_c[k]}\t{cum / total_words * 100:.1f}\t"
                    f"{'; '.join(g for g, _ in gl_en[k].most_common(3))}\n")

    def best_gloss(counter, other=None):
        for g, _ in counter.most_common(5):
            g = (g or '').strip()
            if not g or (other is not None and g.lower() == other.lower()):
                continue
            return g
        return ''

    # ---- curated vocabulary ---------------------------------------------
    vocab, problems = [], []
    lemma_vocab = {}
    for path in sorted(glob.glob(os.path.join(HERE, 'vocab', '*.txt'))):
        for ln, line in enumerate(open(path, encoding='utf-8'), 1):
            line = line.rstrip('\n')
            if not line.strip() or line.startswith('#'):
                continue
            parts = line.split('|')
            if len(parts) != 9:
                problems.append(f'{os.path.basename(path)}:{ln}: expected 9 fields, got {len(parts)}')
                continue
            ranks, skel, ar, ar2, en, tr, de, cog, note = [p.strip() for p in parts]
            keys = []
            for r in ranks.split(','):
                r = int(r)
                if r < 1 or r > len(order):
                    problems.append(f'{path}:{ln}: rank {r} out of range')
                    continue
                keys.append(order[r - 1])
            if not keys:
                continue
            lem = keys[0].split('|')[1]
            ok = skeleton(lem) == skeleton(skel) if not lem.startswith(('PRON:', 'DEM:')) else lem == skel
            if not ok:
                problems.append(f'{os.path.basename(path)}:{ln}: rank {ranks} is {keys[0]} '
                                f'(skeleton {skeleton(lem)}) but line says {skel}')
            vid = len(vocab)
            for k in keys:
                if k in lemma_vocab:
                    problems.append(f'{path}:{ln}: lemma {k} already used by vocab #{lemma_vocab[k]}')
                lemma_vocab[k] = vid
            cls, _, root = keys[0].split('|')
            count = sum(stem_c[k] for k in keys) or sum(all_c[k] for k in keys)
            vocab.append({
                'id': vid, 'l': [lemma_id[k] for k in keys], 'ar': ar, 'ar2': ar2,
                'en': en, 'tr': tr, 'de': de, 'cog': cog, 'note': note,
                'r': root, 'p': cls, 'c': count, 'rank': int(ranks.split(',')[0]),
            })
    if problems:
        print('\n'.join(problems), file=sys.stderr)
        sys.exit(1)

    # ---- example verse for every vocabulary item -------------------------
    verse_words = collections.defaultdict(list)
    for loc in morph:
        verse_words[loc[:2]].append(loc)

    def verse_score(sv):
        locs = verse_words[sv]
        n = len(locs)
        rarity = 0
        for loc in locs:
            si, keys = seg_keys[loc]
            k = keys[si]
            rarity += min(lemma_id.get(k, 5000), 5000) if k else 0
        span = 0 if 4 <= n <= 14 else (40 if n < 4 else n * 4)
        return span + n + rarity / max(n, 1) / 60

    for item in vocab:
        keys = [order[i] for i in item['l']]
        cands = []
        for k in keys:
            cands.extend(occurrences[k] or any_occ[k])
        if not cands:
            continue
        seen, best = set(), None
        for loc in cands:
            sv = loc[:2]
            if sv in seen:
                continue
            seen.add(sv)
            sc = verse_score(sv)
            if best is None or sc < best[0]:
                best = (sc, loc)
        s, v, w = best[1]
        vt = qv[(s, v)]
        item['ex'] = {
            'ref': f'{s}:{v}', 'w': w - 1,
            'ar': [qw[loc]['x'] for loc in verse_words[(s, v)]],
            'l': [lemma_id.get(seg_keys[loc][1][seg_keys[loc][0]], -1) if seg_keys[loc][1][seg_keys[loc][0]] else -1
                  for loc in verse_words[(s, v)]],
            'en': clean_translation(vt.get('en')), 'tr': clean_translation(vt.get('tr')),
            'de': clean_translation(vt.get('de')),
        }

    # ---- lemma table -----------------------------------------------------
    lemmas = []
    for k in order:
        cls, lem, root = k.split('|')
        ar = SYNTH_AR.get(lem, lem)
        en = best_gloss(gl_en[k])
        tr = best_gloss(gl_tr[k], other=en)
        lemmas.append([ar, root, cls, stem_c[k], all_c[k], en, tr, lemma_vocab.get(k, -1)])

    # ---- per-surah files -------------------------------------------------
    feats, feat_id = [], {}
    surah_verses = collections.defaultdict(list)
    for (s, v), locs in sorted(verse_words.items()):
        words = []
        for loc in locs:
            si, keys = seg_keys[loc]
            segs = []
            for sg, k in zip(morph[loc], keys):
                fs = sg['cls'] + ':' + '|'.join(sg['f'] + ([f"FAM:{sg['fam']}"] if sg['fam'] else []))
                if fs not in feat_id:
                    feat_id[fs] = len(feats)
                    feats.append(fs)
                segs.append([sg['text'], feat_id[fs], lemma_id[k] if k else -1])
            q = qw[loc]
            en = q.get('en', '')
            tr = q.get('tr', '')
            if tr.strip().lower() == en.strip().lower():
                tr = ''
            words.append([q['x'], en, tr, si, segs])
        vt = qv[(s, v)]
        surah_verses[s].append({
            'a': v, 'w': words,
            'en': clean_translation(vt.get('en')), 'tr': clean_translation(vt.get('tr')),
            'de': clean_translation(vt.get('de')),
        })
    for s, verses in surah_verses.items():
        write_json(os.path.join(OUT, 'quran', f'{s:03d}.json'), {'s': s, 'v': verses})

    # ---- surah metadata --------------------------------------------------
    chapters = {}
    for lang in ('en', 'tr', 'de'):
        for c in json.load(open(os.path.join(CACHE, 'qcom', f'chapters_{lang}.json')))['chapters']:
            d = chapters.setdefault(c['id'], {
                'n': c['id'], 'ar': c['name_arabic'], 'name': c['name_simple'],
                'place': c['revelation_place'], 'order': c['revelation_order'],
                'verses': c['verses_count'], 'pages': c['pages'],
            })
            d[lang] = c['translated_name']['name']
    surahs = [chapters[i] for i in range(1, 115)]
    for d, name in zip(surahs, DE_SURAH_NAMES):
        d['de'] = name  # Quran.com has no German surah names
    surah_lemmas = {}
    for d in surahs:
        d['words'] = sum(len(v['w']) for v in surah_verses[d['n']])
        hist = collections.Counter()
        for loc in morph:
            if loc[0] == d['n']:
                si, keys = seg_keys[loc]
                if keys[si]:
                    hist[lemma_id[keys[si]]] += 1
        # flat [lemmaId, count, lemmaId, count, ...] keeps the file small
        surah_lemmas[d['n']] = [x for lid, c in sorted(hist.items()) for x in (lid, c)]
    write_json(os.path.join(OUT, 'surah_lemmas.json'), surah_lemmas)

    write_json(os.path.join(OUT, 'lemmas.json'), {'total': total_words, 'l': lemmas})
    write_json(os.path.join(OUT, 'feats.json'), feats)
    write_json(os.path.join(OUT, 'vocab.json'), vocab)
    write_json(os.path.join(OUT, 'surahs.json'), surahs)

    covered = sum(sum(stem_c[order[i]] for i in it['l']) for it in vocab)
    print(f'words {total_words}, lemmas {len(lemmas)}, features {len(feats)}, vocab {len(vocab)}')
    print(f'curated vocabulary covers {covered / total_words * 100:.1f}% of all words')


if __name__ == '__main__':
    main()
