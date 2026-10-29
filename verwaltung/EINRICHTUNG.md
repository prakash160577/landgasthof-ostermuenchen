# Verwaltungsseite einrichten (einmalig, am PC, ca. 20 Minuten)

Ergebnis: Unter **https://landgasthof-ostermuenchen.de/verwaltung/** kann der Wirt mit PIN
per Sprache, Text und Foto die Homepage ändern – mit Vorschau und „Rückgängig“.
Impressum und Datenschutzerklärung sind gesperrt.

## 1. Claude-Schlüssel (Anthropic)
Hinweis: Das ist **nicht** das Claude-Abo, sondern die Entwickler-Konsole mit eigener Abrechnung.
1. https://console.anthropic.com öffnen und anmelden.
2. **Billing** → Guthaben aufladen (z. B. 10 €) und ein **Monatslimit** setzen (z. B. 20 €).
3. **API Keys** → **Create Key** → Name „Landgasthof-Verwaltung“ → Schlüssel kopieren (wird nur einmal angezeigt).

Kosten: etwa 2–20 Cent pro Änderung.

## 2. GitHub-Schlüssel (nur für die Homepage)
1. GitHub → Profilbild → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Name: „Landgasthof-Verwaltung“, Ablauf: 1 Jahr.
3. **Repository access**: *Only select repositories* → `landgasthof-ostermuenchen`.
4. **Permissions** → Repository permissions → **Contents: Read and write**.
5. **Generate token** → kopieren.

## 3. Google Apps Script
1. https://script.google.com → **Neues Projekt** → Name „Landgasthof Verwaltung“.
2. Den gesamten Inhalt von `verwaltung/apps-script.gs` einfügen (vorhandenen Code ersetzen) → speichern.
3. Zahnrad **Projekteinstellungen** → **Skripteigenschaften** → drei Einträge:
   - `PIN` → die PIN für den Wirt (mind. 6 Ziffern)
   - `ANTHROPIC_KEY` → Schlüssel aus Schritt 1
   - `GITHUB_TOKEN` → Schlüssel aus Schritt 2
4. Im Editor oben die Funktion **testeEinrichtung** wählen → **Ausführen** → Berechtigungen erlauben.
   Im Protokoll muss „GitHub: letzte Änderung …“ und „Claude: 200 …“ stehen.
5. **Bereitstellen** → **Neue Bereitstellung** → Typ **Web-App**
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
   → **Bereitstellen** → die Web-App-URL (endet auf `/exec`) kopieren.

## 4. Abschluss (Claude)
Die Web-App-URL an Claude schicken. Claude trägt sie in `verwaltung/index.html` ein (`BACKEND`)
und testet die Seite. Danach bekommt der Wirt Link und PIN und legt die Seite auf den Startbildschirm
(Chrome → ⋮ → „Zum Startbildschirm hinzufügen“).

## Sicherheit
- Der GitHub-Schlüssel darf nur dieses eine Repo ändern. Jede Änderung ist in GitHub gespeichert und umkehrbar.
- Nach 8 falschen PIN-Eingaben ist die Seite 15 Minuten gesperrt.
- PIN ändern: in den Skripteigenschaften. Zugang sperren: Bereitstellung im Apps Script archivieren.
