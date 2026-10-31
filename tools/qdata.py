"""Shared parsing helpers for the Quran data pipeline."""
import collections, glob, json, os, re

PGN_RE = re.compile(r'^([123])([MF]?)([SDP])$')
# person-gender-number codes that may appear on pronoun/verb segments
def pgn_of(tags):
    for t in tags:
        if PGN_RE.match(t):
            return t
    return None

def norm_pron_pgn(p):
    """Collapse pronoun person codes into the 12 learnable pronoun items."""
    if p is None: return None
    m = PGN_RE.match(p)
    person, g, n = m.groups()
    if n == 'D':
        return person + 'D'          # duals are gender-indifferent for learning
    if person == '1':
        return '1' + n               # 1S / 1P
    return person + (g or 'M') + n   # 2MS, 2FS, 2MP, 2FP, 3MS ...

def parse_morph(path):
    words = collections.OrderedDict()
    for line in open(path, encoding='utf-8'):
        line = line.rstrip('\n')
        if not line or line.startswith('#'):
            continue
        loc, text, cls, feats = line.split('\t')
        s, v, w, g = map(int, loc.split(':'))
        tags = feats.split('|')
        seg = {'text': text, 'cls': cls, 'tags': tags, 'lem': None, 'root': None, 'fam': None}
        rest = []
        for t in tags:
            if t.startswith('LEM:'): seg['lem'] = t[4:]
            elif t.startswith('ROOT:'): seg['root'] = t[5:]
            elif t.startswith('FAM:'): seg['fam'] = t[4:]
            else: rest.append(t)
        seg['f'] = rest
        words.setdefault((s, v, w), []).append(seg)
    return words

def is_affix(seg):
    return 'PREF' in seg['f'] or 'SUFF' in seg['f']

def stem_index(segs):
    for i, sg in enumerate(segs):
        if not is_affix(sg):
            return i
    return 0

def lemma_key(seg, segs):
    """Return a stable lemma key for one segment, or None for pure inflection."""
    f = seg['f']
    if 'DEM' in f and seg['lem'] == 'ذا':
        near = any('ATT' in s['f'] for s in segs)
        far = any(('DIST' in s['f']) or ('ADDR' in s['f']) for s in segs)
        gn = next((t for t in f if t in ('MS', 'FS', 'MD', 'FD', 'P', 'MP', 'FP', 'D')), 'MS')
        num = 'P' if gn in ('P', 'MP', 'FP') else ('D' if 'D' in gn else gn)
        dist = 'far' if far and not near else 'near'
        return f'N|DEM:{dist}:{num}|'
    if 'ADDR' in f and seg['lem'] is None:
        return None
    if seg['lem'] is None and 'PRON' in f:
        return f'N|PRON:{norm_pron_pgn(pgn_of(f))}|'
    if seg['lem'] is None:
        return None
    return f"{seg['cls']}|{seg['lem']}|{seg['root'] or ''}"

def load_qcom(qdir):
    """Return {(s,v,w): (text, en, tr)} and {(s,v): {'en':..,'tr':..,'de':..}}, plus verse text."""
    words, verses = {}, {}
    for lang in ('en', 'tr'):
        for p in sorted(glob.glob(os.path.join(qdir, lang, '*.json'))):
            data = json.load(open(p, encoding='utf-8'))
            for v in data['verses']:
                s, a = map(int, v['verse_key'].split(':'))
                vv = verses.setdefault((s, a), {})
                if lang == 'en':
                    vv['text'] = v['text_uthmani']
                    for t in v.get('translations', []):
                        k = {20: 'en', 77: 'tr', 27: 'de'}.get(t['resource_id'])
                        if k: vv[k] = t['text']
                for w in v['words']:
                    if w['char_type_name'] != 'word':
                        continue
                    key = (s, a, w['position'])
                    rec = words.setdefault(key, {})
                    rec['x'] = w['text_uthmani']
                    rec[lang] = (w.get('translation') or {}).get('text') or ''
    return words, verses
