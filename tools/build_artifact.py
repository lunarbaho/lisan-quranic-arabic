#!/usr/bin/env python3
"""Package Lisan as a single-page claude.ai Artifact.

    python3 tools/build_artifact.py OUT_DIR

Bundles app/js into one inline module (esbuild), inlines the CSS, keeps the
data files separate (they are fetched with relative URLs), and drops the
service worker and manifest, which an artifact frame does not use.
Set ESBUILD=/path/to/esbuild to use a local binary; otherwise npx is used.
"""
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(os.path.dirname(HERE), 'app')


def block(html, name):
    m = re.search(rf'<!--lisan:{name}-->(.*?)<!--/lisan:{name}-->', html, re.S)
    if not m:
        raise SystemExit(f'index.html is missing the lisan:{name} markers')
    return m.group(1).strip()


def main(out):
    os.makedirs(out, exist_ok=True)
    bundle = os.path.join(out, 'bundle.js')
    esbuild = os.environ.get('ESBUILD')
    cmd = [esbuild] if esbuild else ['npx', '--yes', 'esbuild@0.24.0']
    subprocess.run(cmd + [os.path.join(APP, 'js', 'main.js'), '--bundle', '--format=esm', '--minify',
                          '--target=es2020', '--legal-comments=none', f'--outfile={bundle}'], check=True)
    js = open(bundle, encoding='utf-8').read().replace('</script', '<\\/script')
    css = open(os.path.join(APP, 'css', 'app.css'), encoding='utf-8').read()
    html = open(os.path.join(APP, 'index.html'), encoding='utf-8').read()
    title = re.search(r'<title>.*?</title>', html).group(0)
    head = block(html, 'head').replace('<link rel="stylesheet" href="css/app.css">', f'<style>\n{css}\n</style>')
    body = block(html, 'body').replace('<script type="module" src="js/main.js"></script>', f'<script type="module">{js}</script>')
    # the charset must come first: the bundle and the content are full of Arabic
    page = f'<meta charset="utf-8">\n{title}\n<meta name="claude:viewport-fit-sides" content="cover">\n{head}\n{body}\n'
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(page)
    os.remove(bundle)
    data_out = os.path.join(out, 'data')
    if os.path.exists(data_out):
        shutil.rmtree(data_out)
    shutil.copytree(os.path.join(APP, 'data'), data_out)
    print(f'artifact page: {os.path.getsize(os.path.join(out, "index.html")) // 1024} KB, data files copied to {data_out}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), 'build', 'artifact'))
