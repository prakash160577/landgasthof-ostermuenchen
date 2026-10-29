# Landgasthof Ostermünchen – Website

1:1-Nachbau der bisherigen STRATO-Seite als statische Website auf GitHub Pages.
Design, Texte, Bilder und Schriften sind direkt aus der Live-Seite übernommen.

## Stand

| Ort | Inhalt |
|---|---|
| `neu/` | **Neue Website (Vorschau)** – https://prakash160577.github.io/landgasthof-ostermuenchen/neu/ |
| Zweig `alt-version` | Gesicherter früherer GitHub-Nachbau |
| Stamm (`index.html`, `pages/`, `js/`, `admin/` …) | Früherer GitHub-Nachbau, wird beim Umzug durch `neu/` ersetzt |
| `speisekarte-ohne-deckblatt.html` | Speisekarte; wird von der Speisekarten-Seite eingebettet (auch von der STRATO-Seite) |

## Tageskarte austauschen

```bash
python3 tools/tageskarte.py /pfad/zum/bild.jpg
git add -A && git commit -m "Tageskarte aktualisiert" && git push
```

Das Skript speichert das Bild als `tageskarte/tageskarte.jpg` (in jedem vorhandenen
Tageskarten-Ordner), passt das Seitenverhältnis an und setzt eine neue Versionsnummer,
damit Besucher sofort die neue Karte sehen. Die Tageskarte erscheint auf
**Startseite, Speisekarte und Aktuelles**. Nach dem Push ist sie in ca. 1–2 Minuten online.

## Aufbau

```
neu/
├── index.html                  Startseite
├── speisekarte/ raeume/ aktuelles/ kontakt/ do-samma/ impressum/ datenschutzerklarung/
├── tageskarte/tageskarte.jpg   aktuelle Tageskarte
├── site/site.css, site.js      eigene Ergänzungen (Karte nach Zustimmung, Tageskarte)
└── wp-content/                 Original-Bilder, CSS und Schriften der STRATO-Seite
tools/
├── tageskarte.py               Tageskarte austauschen
└── strato-import.py            einmaliger Import aus der STRATO-Seite (Dokumentation)
```

Texte ändern: direkt in der jeweiligen `index.html` (Text steht im HTML).

## Umzug der Domain (erst nach Freigabe)

Siehe `UMZUG.md`.
