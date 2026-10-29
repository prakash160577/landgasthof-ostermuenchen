#!/usr/bin/env python3
"""Statischer 1:1-Nachbau der STRATO-Seite landgasthof-ostermuenchen.de.

Liest das Roh-HTML aus RAW, entfernt Strato/WordPress-Skripte, Consent-Banner
und Übersetzer, schreibt alle Asset-URLs auf relative Pfade um und lädt fehlende
Assets (Bilder, CSS, Schriften) nach.
"""
import os, re, sys, subprocess, urllib.parse, base64, html as html_lib
from bs4 import BeautifulSoup, Comment
from PIL import Image

TK_ID = '23430006-2903-482f-8f51-dfe107e34b50'   # Strato-Bild der Tageskarte
MAPS_URL = ('https://maps.google.com/maps?q=Rotter+Stra%C3%9Fe+2,+83104+Tuntenhausen'
            '&t=k&z=15&hl=de&output=embed')

RAW, OUT = sys.argv[1], sys.argv[2]
ASSETS = sys.argv[3] if len(sys.argv) > 3 else os.path.join(OUT, '_dl')
HOST = 'https://landgasthof-ostermuenchen.de'

# Seite -> Ausgabepfad (Ordner, relativ zu OUT)
PAGES = {
    'startseite': '',
    'speisekarte': 'speisekarte',
    'raeume': 'raeume',
    'aktuelles': 'aktuelles',
    'kontakt': 'kontakt',
    'do-samma': 'do-samma',
    'impressum': 'impressum',
    'datenschutzerklarung': 'datenschutzerklarung',
}
SLUGS = set(PAGES.values()) - {''}

needed = set()   # Asset-Pfade ab Root, z. B. /wp-content/uploads/...


def norm_asset(path):
    """/wp-content/... -> Pfad ohne Query, ab Root."""
    path = path.split('#')[0].split('?')[0]
    return urllib.parse.unquote(path)


def rel_prefix(folder):
    return '../' * (folder.count('/') + 1) if folder else ''


def rewrite_url(u, prefix):
    if not u:
        return u
    u = u.strip()
    if u.startswith(HOST):
        u = u[len(HOST):] or '/'
    if u.startswith('//') or re.match(r'^[a-z]+:', u):
        return u  # extern (https:, mailto:, tel:, data:)
    if u.startswith('/wp-content/') or u.startswith('/wp-includes/'):
        p = norm_asset(u)
        needed.add(p)
        return prefix + urllib.parse.quote(p.lstrip('/'), safe='/,.-_~')
    if u.startswith('/'):
        path, _, frag = u.partition('#')
        slug = path.strip('/').split('?')[0]
        if slug == '':
            target = prefix or './'
        elif slug in SLUGS:
            target = prefix + slug + '/'
        else:
            return u
        return target + ('#' + frag if frag else '')
    return u


def rewrite_srcset(v, prefix):
    parts = []
    for item in v.split(','):
        item = item.strip()
        if not item:
            continue
        bits = item.split()
        bits[0] = rewrite_url(bits[0], prefix)
        parts.append(' '.join(bits))
    return ', '.join(parts)


def fix_srcset_commas(v):
    # Strato-Pfade enthalten Kommas (l0,t0,w2000,h1501) -> nur an ", " oder "w," trennen
    return v


def rewrite_css(css, prefix):
    def rep(m):
        q, u = m.group(1), m.group(2)
        return f'url({q}{rewrite_url(u, prefix)}{q})'
    return re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', rep, css)


def split_srcset(v):
    # Einträge enden mit " <zahl>w" oder " <zahl>x", danach Komma
    return [m.group(0).strip().rstrip(',') for m in re.finditer(r'\S.*?\s\d+(?:\.\d+)?[wx](?:,|$)', v)]


def build_page(name, folder):
    html = open(os.path.join(RAW, name + '.html'), encoding='utf-8').read()
    s = BeautifulSoup(html, 'html.parser')
    prefix = rel_prefix(folder)

    # Skripte, Kommentare, WP-Metalinks entfernen
    for t in s.find_all('script'):
        t.decompose()
    for c in s.find_all(string=lambda x: isinstance(x, Comment)):
        c.extract()
    for l in s.find_all('link'):
        rel = ' '.join(l.get('rel', []))
        href = l.get('href', '')
        if any(k in rel for k in ('EditURI', 'alternate', 'https://api.w.org/', 'shortlink', 'profile', 'pingback', 'dns-prefetch')) \
                or 'wp-json' in href or 'xmlrpc' in href:
            l.decompose()
    for m in s.find_all('meta', attrs={'name': 'generator'}):
        m.decompose()

    # Consent-Banner, Übersetzer-Blocker, Datenschutz-Popup entfernen
    for sel in ['#pbModal', '.consent-banner-root', 'aside']:
        for t in s.select(sel):
            if sel == 'aside' and not t.select('.privacy-settings-root'):
                continue
            t.decompose()

    # HTML-Module (base64, sonst per Strato-JS eingefügt) direkt einsetzen
    for d in s.select('[data-encoded-html]'):
        code = base64.b64decode(html_lib.unescape(d['data-encoded-html'])).decode('utf-8')
        code = code.replace('https://prakash160577.github.io/landgasthof-ostermuenchen/', '/')
        frag = BeautifulSoup(code, 'html.parser')
        for t in frag.find_all(src=True):
            if t['src'].startswith('/speisekarte-ohne-deckblatt'):
                t['src'] = prefix + t['src'].lstrip('/')
        d.replace_with(frag)

    # Google-Maps-Blocker sichtbar machen; Karte ohne Strato-API-Schlüssel
    for b in s.select('.module-blocker-root'):
        b['style'] = re.sub(r';?\s*visibility:\s*hidden', '', b.get('style', ''))
    for m in s.select('.map-root[data-src]'):
        m['data-src'] = MAPS_URL

    # Tageskarte: festes, austauschbares Bild
    for img in s.select('img'):
        if TK_ID in img.get('src', ''):
            for a in ('srcset', 'sizes'):
                if img.has_attr(a):
                    del img[a]
            img['src'] = prefix + 'tageskarte/tageskarte.jpg?v=' + TK_VERSION
            img['alt'] = 'Tageskarte'
            img['class'] = img.get('class', []) + ['tageskarte-bild']
            wrap = img.find_parent(class_='image-wrapper')
            if wrap is not None:
                wrap['style'] = re.sub(r'padding-bottom:[\d.]+%', f'padding-bottom:{TK_RATIO}%', wrap['style'])
    for l in s.find_all('link', attrs={'rel': 'preload'}):
        if TK_ID in l.get('imagesrcset', '') + l.get('href', ''):
            l.decompose()

    # URLs umschreiben
    for t in s.find_all(True):
        for attr in ('href', 'src', 'poster', 'data-src'):
            if t.has_attr(attr):
                if t.name == 'link' and 'canonical' in t.get('rel', []):
                    continue
                t[attr] = rewrite_url(t[attr], prefix)
        for attr in ('srcset', 'imagesrcset', 'data-srcset'):
            if t.has_attr(attr):
                items = split_srcset(t[attr])
                out = []
                for it in items:
                    u, _, d = it.rpartition(' ')
                    out.append(rewrite_url(u.strip(), prefix) + ' ' + d)
                t[attr] = ', '.join(out)
        if t.has_attr('style'):
            t['style'] = rewrite_css(t['style'], prefix)
    for st in s.find_all('style'):
        st.string = rewrite_css(st.string or '', prefix)

    # Eigene Ergänzungen (CSS/JS) einhängen
    s.head.append(BeautifulSoup(f'<link rel="stylesheet" href="{prefix}site/site.css">', 'lxml').link)
    s.body.append(BeautifulSoup(f'<script src="{prefix}site/site.js" defer></script>', 'lxml').script)

    out_dir = os.path.join(OUT, folder)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(str(s))


TK_FILE = os.path.join(OUT, 'tageskarte', 'tageskarte.jpg')
with Image.open(TK_FILE) as _im:
    TK_RATIO = round(_im.height / _im.width * 100, 4)
TK_VERSION = str(int(os.path.getmtime(TK_FILE)))

for n, f in PAGES.items():
    build_page(n, f)


def fetch(path):
    dst = os.path.join(OUT, path.lstrip('/'))
    if os.path.exists(dst):
        return dst
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    url = HOST + urllib.parse.quote(path, safe='/,.-_~')
    r = subprocess.run(['curl', '-sS', '-f', '-m', '60', '-o', dst, url], capture_output=True, text=True)
    if r.returncode != 0:
        print('FEHLT', path, r.stderr.strip()[:120])
        return None
    return dst


# Assets laden; CSS-Dateien rekursiv nach url() durchsuchen
done = set()
while needed - done:
    for p in sorted(needed - done):
        done.add(p)
        dst = fetch(p)
        if dst and dst.endswith('.css'):
            css = open(dst, encoding='utf-8', errors='replace').read()
            base = os.path.dirname(p)
            # relative url() in CSS -> absolut auflösen, damit sie mitgeladen werden
            for u in re.findall(r'url\(\s*[\'"]?([^\'")]+)', css):
                if u.startswith('data:') or re.match(r'^[a-z]+:', u):
                    continue
                absu = u if u.startswith('/') else os.path.normpath(base + '/' + u.split('?')[0].split('#')[0])
                if absu.startswith('/wp-'):
                    needed.add(norm_asset(absu))
            # Root-relative url() in CSS-Dateien relativ zur CSS-Datei machen
            depth = p.lstrip('/').count('/')
            pre = '../' * depth
            css2 = re.sub(r'url\(\s*([\'"]?)/(wp-[^\'")]+)\1\s*\)', lambda m: f'url({m.group(1)}{pre}{m.group(2)}{m.group(1)})', css)
            if css2 != css:
                open(dst, 'w', encoding='utf-8').write(css2)

print('Seiten:', len(PAGES), 'Assets:', len(done))
