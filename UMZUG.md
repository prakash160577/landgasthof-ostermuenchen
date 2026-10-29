# Umzug landgasthof-ostermuenchen.de von STRATO auf GitHub Pages

Die Domain und die E-Mail (wirt@landgasthof-ostermuenchen.de) **bleiben bei STRATO**.
Geändert wird nur, wohin die Website zeigt. Die E-Mail-Einträge (MX) werden nicht angefasst.

## Schritt 1 – Claude bereitet das Repo vor
- Inhalt von `neu/` wird in den Stamm verschoben (alte Dateien sind im Zweig `alt-version` gesichert)
- Datei `CNAME` mit `landgasthof-ostermuenchen.de` wird angelegt
- Impressum und Datenschutzerklärung auf GitHub-Hosting angepasst

## Schritt 2 – GitHub (am PC, ca. 2 Minuten)
1. github.com → Repo `landgasthof-ostermuenchen` → **Settings** → **Pages**
2. Bei **Custom domain** `landgasthof-ostermuenchen.de` eintragen → **Save**
3. Nach erfolgreicher Prüfung **Enforce HTTPS** anhaken (kann bis zu 24 Std. dauern, bis die Option erscheint)

## Schritt 3 – STRATO (am PC, ca. 5 Minuten)
1. STRATO-Kundenlogin → **Domains** → **Domainverwaltung**
2. Bei `landgasthof-ostermuenchen.de` auf das Zahnrad / **Verwalten** → **DNS**
3. **A-Record** → *verwalten* → „andere IP-Adresse“ und diese vier eintragen:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
4. **AAAA-Record** (IPv6) → *verwalten* → entweder leeren oder diese eintragen:
   - `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
5. Subdomain **www**: CNAME-Record auf `prakash160577.github.io` setzen
6. **MX-Record NICHT ändern** – muss auf „STRATO Mailserver“ stehen bleiben

Die Umstellung wird je nach DNS-Cache innerhalb von Minuten bis wenigen Stunden wirksam.
In dieser Zeit sehen manche Besucher noch die alte, andere schon die neue Seite – beide sehen gleich aus.

## Schritt 4 – Prüfen
- https://landgasthof-ostermuenchen.de lädt die neue Seite (Schloss-Symbol im Browser)
- Testmail an wirt@landgasthof-ostermuenchen.de senden und empfangen
- Danach kann der STRATO-Website-Baukasten (SmartWebsite) gekündigt werden –
  **nicht** die Domain und **nicht** das E-Mail-Paket

## Zurück zur alten Seite (falls nötig)
In STRATO bei A-Record wieder „STRATO-Standard“ wählen.
