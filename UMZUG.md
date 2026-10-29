# Domain landgasthof-ostermuenchen.de – Einstellungen

**Umgestellt am 29.10.2026.** Die Website läuft auf GitHub Pages, Domain und E-Mail bleiben bei STRATO.

## Aktuelle DNS-Einstellungen bei STRATO
(Kundenlogin → Paket „STRATO SmartWebsite Pro“ → ⋮ → Domains → Zahnrad → DNS)

| Name | Typ | Wert |
|---|---|---|
| landgasthof-ostermuenchen.de | A | 185.199.108.153 (GitHub) |
| landgasthof-ostermuenchen.de | AAAA | 2606:50c0:8000::153 (GitHub) |
| www.landgasthof-ostermuenchen.de | A | 185.199.108.153 (GitHub, Subdomain angelegt) |
| www.landgasthof-ostermuenchen.de | AAAA | 2606:50c0:8000::153 (GitHub) |
| landgasthof-ostermuenchen.de | MX | **STRATO Mailserver – nicht ändern** |

STRATO erlaubt nur eine A-Adresse; GitHub Pages funktioniert damit.
Die Datei `CNAME` im Repo trägt die Domain bei GitHub Pages ein. `www` leitet automatisch auf die Hauptadresse weiter.

## ⚠️ Wichtig: Paket nicht kündigen
Die Domain und das E-Mail-Postfach gehören zum Paket **„STRATO SmartWebsite Pro“**.
Wer dieses Paket kündigt, verliert Domain und E-Mail. Eine Umstellung auf ein günstigeres
reines Domain-/E-Mail-Paket nur mit STRATO abklären, damit Domain und Postfach übernommen werden.

## Offener Punkt
GitHub → Repo → Settings → Pages → **„Enforce HTTPS“** anhaken (mit GitHub-Login),
damit http:// automatisch auf https:// umgeleitet wird.

## Zurück zur alten STRATO-Seite (falls nötig)
Bei A- und AAAA-Record (Hauptdomain und www) wieder „STRATO Standard IP-Adresse“ wählen.
