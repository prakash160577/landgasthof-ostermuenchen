#!/usr/bin/env python3
"""Tageskarte austauschen.

Aufruf:  python3 tools/tageskarte.py <bilddatei> [website-ordner]

- dreht das Bild nach EXIF-Ausrichtung, wandelt in RGB um, begrenzt auf 1400 px Breite
- speichert es als <website-ordner>/tageskarte/tageskarte.jpg
- setzt in allen Seiten mit Tageskarte die neue Versionsnummer (gegen Browser-Cache)
  und das Seitenverhältnis des Bildrahmens
Standard-Website-Ordner ist der Repo-Stamm (Ordner über tools/).
"""
import os, re, sys, time
from PIL import Image, ImageOps

MAX_W = 1400


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = sys.argv[1]
    root = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)

    # in jeden vorhandenen Tageskarten-Ordner schreiben (Live-Seite und ggf. Vorschau /neu/)
    targets = []
    for dirpath, dirnames, files in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ('.git', 'tools')]
        if os.path.basename(dirpath) == 'tageskarte' and 'tageskarte.jpg' in files:
            targets.append(os.path.join(dirpath, 'tageskarte.jpg'))
    if not targets:
        targets = [os.path.join(root, 'tageskarte', 'tageskarte.jpg')]
    for dst in targets:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im.save(dst, 'JPEG', quality=86, optimize=True, progressive=True)

    ratio = round(im.height / im.width * 100, 4)
    version = str(int(time.time()))
    changed = []
    for dirpath, _, files in os.walk(root):
        if '/.git' in dirpath or os.sep + 'tools' in dirpath:
            continue
        for f in files:
            if not f.endswith('.html'):
                continue
            p = os.path.join(dirpath, f)
            h = open(p, encoding='utf-8').read()
            if 'tageskarte-bild' not in h:
                continue
            h2 = re.sub(r'(tageskarte/tageskarte\.jpg\?v=)\d+', r'\g<1>' + version, h)
            # padding-bottom des Bildrahmens direkt vor dem Tageskarten-Bild
            h2 = re.sub(r'(<div class="image-wrapper" style="padding-bottom:)[\d.]+(%[^"]*">\s*<img[^>]*tageskarte-bild)',
                        r'\g<1>' + str(ratio) + r'\2', h2)
            if h2 != h:
                open(p, 'w', encoding='utf-8').write(h2)
                changed.append(os.path.relpath(p, root))
    print('Tageskarte gespeichert:', ', '.join(os.path.relpath(t, root) for t in targets), f'({im.width}x{im.height})')
    print('Aktualisierte Seiten:', ', '.join(changed) or 'keine')


if __name__ == '__main__':
    main()
