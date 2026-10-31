#!/usr/bin/env python3
"""Download the raw sources used to build the app data (cached in tools/.cache).

* Quranic Arabic Corpus morphology (v0.4, corrected fork by mustafa0x) — GPL
* Quran.com API v4: Uthmani word text, word-by-word English + Turkish,
  verse translations: Saheeh International (en), Diyanet İşleri (tr),
  Bubenheim & Elyas (de)
"""
import json, os, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '.cache')
MORPH_URL = 'https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt'
API = 'https://api.quran.com/api/v4'
TRANSLATIONS = '20,77,27'   # Saheeh International, Diyanet, Bubenheim & Elyas


def get(url, tries=6, as_json=True):
    delay = 2
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'lisan-quran-app-builder/1.0'})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return json.loads(data.decode('utf-8')) if as_json else data
        except Exception as e:  # network hiccup: back off and retry
            print(f'  retry {i + 1}: {url} ({e})', file=sys.stderr)
            time.sleep(delay)
            delay *= 2
    raise RuntimeError('download failed: ' + url)


def main():
    os.makedirs(CACHE, exist_ok=True)
    morph = os.path.join(CACHE, 'quran-morphology.txt')
    if not os.path.exists(morph):
        print('downloading morphology…')
        open(morph, 'wb').write(get(MORPH_URL, as_json=False))
    qdir = os.path.join(CACHE, 'qcom')
    os.makedirs(qdir, exist_ok=True)
    for lang in ('en', 'tr', 'de'):
        p = os.path.join(qdir, f'chapters_{lang}.json')
        if not os.path.exists(p):
            json.dump(get(f'{API}/chapters?language={lang}'), open(p, 'w'), ensure_ascii=False)
    for lang in ('en', 'tr'):
        d = os.path.join(qdir, lang)
        os.makedirs(d, exist_ok=True)
        for ch in range(1, 115):
            page = 1
            while True:
                p = os.path.join(d, f'{ch:03d}_{page:02d}.json')
                if os.path.exists(p):
                    data = json.load(open(p))
                else:
                    tr = f'&translations={TRANSLATIONS}' if lang == 'en' else ''
                    url = (f'{API}/verses/by_chapter/{ch}?language={lang}&words=true'
                           f'&word_fields=text_uthmani&fields=text_uthmani&per_page=50&page={page}{tr}')
                    data = get(url)
                    json.dump(data, open(p, 'w'), ensure_ascii=False)
                    time.sleep(0.2)
                nxt = data['pagination']['next_page']
                if not nxt:
                    break
                page = nxt
            print(f'{lang} surah {ch} ok', flush=True)
    print('sources ready in', CACHE)


if __name__ == '__main__':
    main()
