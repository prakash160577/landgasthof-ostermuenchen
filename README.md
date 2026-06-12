# Landgasthof Ostermünchen – Website

Statische Website für GitHub Pages. Alle Inhalte werden über `js/data.js` gesteuert.

## Struktur

```
landgasthof/
├── index.html              ← Startseite
├── css/
│   └── style.css           ← Alle Styles
├── js/
│   ├── data.js             ← ⭐ ALLE INHALTE (Speisekarte, Zeiten, News...)
│   └── shared.js           ← Navigation, Hilfsfunktionen
├── pages/
│   ├── speisekarte.html
│   ├── raeume.html
│   ├── aktuelles.html
│   ├── kontakt.html
│   ├── do-samma.html
│   ├── impressum.html
│   └── datenschutz.html
└── admin/
    └── index.html          ← 📱 Admin-App (Smartphone)
```

## Deployment auf GitHub Pages

1. Neues Repository auf GitHub anlegen (z.B. `landgasthof-web`)
2. Alle Dateien hochladen
3. GitHub → Settings → Pages → Source: `main` Branch, `/ (root)` Ordner
4. Domain: Bei GitHub Pages Custom Domain `landgasthof-ostermuenchen.de` eintragen
5. Bei Strato: DNS CNAME auf `<username>.github.io` zeigen lassen (oder A-Records auf GitHub IPs)

## Custom Domain (Strato → GitHub Pages)

Bei Strato im DNS-Bereich:
- `A` Record: `185.199.108.153`
- `A` Record: `185.199.109.153`
- `A` Record: `185.199.110.153`
- `A` Record: `185.199.111.153`
- `CNAME www`: `<username>.github.io`

In GitHub repository eine Datei `CNAME` erstellen mit Inhalt:
```
landgasthof-ostermuenchen.de
```

## Inhalte ändern (ohne Admin-App)

Die Datei `js/data.js` bearbeiten – alle Texte, Preise, Zeiten sind dort gebündelt.

## Admin-App (Smartphone)

URL: `https://landgasthof-ostermuenchen.de/admin/`

Standard-Passwort: `gasthof2025`
→ **Bitte in `admin/index.html` Zeile 10 ändern!**

Die App exportiert eine neue `data.js` → diese bei GitHub hochladen → Website aktualisiert sich.

## Bilder

Die Website lädt Bilder direkt von der alten Strato/WordPress-URL. Langfristig empfohlen:
- Bilder in einen `img/` Ordner im Repository laden
- Pfade in `data.js` und HTML anpassen
