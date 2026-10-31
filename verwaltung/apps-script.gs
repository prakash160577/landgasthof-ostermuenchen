/**
 * Landgasthof Ostermünchen – Homepage-Verwaltung (Hintergrund)
 * -------------------------------------------------------------
 * Läuft als Google-Apps-Script-Web-App. Die Verwaltungsseite
 * (landgasthof-ostermuenchen.de/verwaltung) schickt ihre Anfragen hierher.
 *
 * Skripteigenschaften (Projekteinstellungen → Skripteigenschaften):
 *   PIN            – Zugangs-PIN für die Verwaltungsseite
 *   ANTHROPIC_KEY  – API-Schlüssel von console.anthropic.com
 *   GITHUB_TOKEN   – GitHub-Schlüssel (fine-grained), nur Repo landgasthof-ostermuenchen,
 *                    Berechtigung „Contents: Read and write“
 *
 * Bereitstellen → Neue Bereitstellung → Web-App
 *   Ausführen als: Ich      Zugriff: Jeder
 */

var REPO = 'prakash160577/landgasthof-ostermuenchen';
var BRANCH = 'main';
var MODELL = 'claude-sonnet-5-5';
var PRAEFIX = '[Verwaltung]';

// Dateien, die die Verwaltung lesen und ändern darf (Rechtstexte bewusst nicht)
var ERLAUBT = [
  'index.html',
  'speisekarte/index.html',
  'raeume/index.html',
  'aktuelles/index.html',
  'kontakt/index.html',
  'do-samma/index.html',
  'speisekarte-ohne-deckblatt.html'
];
var ERLAUBT_PRAEFIX = ['bilder/', 'tageskarte/'];

// ------------------------------------------------------------------ Einstieg

function doPost(e) {
  var antwort;
  try {
    var anfrage = JSON.parse(e.postData.contents || '{}');
    pruefePin_(anfrage.pin);
    switch (anfrage.aktion) {
      case 'anmelden':         antwort = { ok: true, status: status_() }; break;
      case 'dateien':          antwort = dateien_(); break;
      case 'vorschlag':        antwort = vorschlag_(anfrage); break;
      case 'veroeffentlichen': antwort = veroeffentlichen_(anfrage); break;
      case 'rueckgaengig':     antwort = rueckgaengig_(); break;
      case 'status':           antwort = { ok: true, status: status_() }; break;
      default: throw fehler_('Unbekannte Aktion.');
    }
  } catch (err) {
    antwort = { ok: false, fehler: err.nutzer ? err.message : 'Interner Fehler: ' + err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(antwort))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, dienst: 'Landgasthof-Verwaltung' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function fehler_(text) { var e = new Error(text); e.nutzer = true; return e; }

function eig_(name) {
  var w = PropertiesService.getScriptProperties().getProperty(name);
  if (!w) throw fehler_('Einrichtung unvollständig: ' + name + ' fehlt in den Skripteigenschaften.');
  return w;
}

// ------------------------------------------------------------------ PIN mit Sperre

function pruefePin_(pin) {
  var cache = CacheService.getScriptCache();
  var fehlversuche = Number(cache.get('fehlversuche') || 0);
  if (fehlversuche >= 8) throw fehler_('Zu viele falsche PIN-Eingaben. Bitte 15 Minuten warten.');
  if (String(pin || '') !== eig_('PIN')) {
    cache.put('fehlversuche', String(fehlversuche + 1), 900);
    throw fehler_('PIN falsch.');
  }
}

// ------------------------------------------------------------------ GitHub

function gh_(methode, pfad, nutzlast) {
  var opt = {
    method: methode,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + eig_('GITHUB_TOKEN'),
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  };
  if (nutzlast) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(nutzlast); }
  var r = UrlFetchApp.fetch('https://api.github.com/repos/' + REPO + pfad, opt);
  var code = r.getResponseCode();
  var text = r.getContentText();
  if (code >= 300) {
    if (code === 401 || code === 403) throw fehler_('GitHub-Zugang abgelehnt (Schlüssel prüfen).');
    throw new Error('GitHub ' + code + ': ' + text.slice(0, 300));
  }
  return text ? JSON.parse(text) : {};
}

function kopf_() {
  var ref = gh_('get', '/git/ref/heads/' + BRANCH);
  var commit = gh_('get', '/git/commits/' + ref.object.sha);
  return { sha: ref.object.sha, baum: commit.tree.sha, nachricht: commit.message, datum: commit.author.date, eltern: commit.parents };
}

function status_() {
  var k = kopf_();
  return {
    sha: k.sha,
    letzteNachricht: k.nachricht,
    letztesDatum: k.datum,
    rueckgaengigMoeglich: k.nachricht.indexOf(PRAEFIX) === 0 && k.nachricht.indexOf(PRAEFIX + ' Rückgängig') !== 0
  };
}

function dateien_() {
  var k = kopf_();
  var inhalt = {};
  ERLAUBT.forEach(function (pfad) {
    var r = UrlFetchApp.fetch('https://api.github.com/repos/' + REPO + '/contents/' + pfad + '?ref=' + k.sha, {
      muteHttpExceptions: true,
      headers: {
        Authorization: 'Bearer ' + eig_('GITHUB_TOKEN'),
        Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (r.getResponseCode() !== 200) throw new Error('Datei ' + pfad + ' nicht lesbar (' + r.getResponseCode() + ')');
    inhalt[pfad] = r.getContentText('UTF-8');
  });
  return { ok: true, sha: k.sha, dateien: inhalt, status: status_() };
}

function istErlaubt_(pfad) {
  if (pfad.indexOf('..') >= 0 || pfad.charAt(0) === '/') return false;
  if (ERLAUBT.indexOf(pfad) >= 0) return true;
  return ERLAUBT_PRAEFIX.some(function (p) { return pfad.indexOf(p) === 0 && /\.(jpe?g|png|webp)$/i.test(pfad); });
}

function commit_(basisSha, dateien, nachricht) {
  var k = kopf_();
  if (basisSha && k.sha !== basisSha) {
    throw fehler_('Die Homepage wurde inzwischen anderweitig geändert. Bitte Seite neu laden und noch einmal versuchen.');
  }
  var baum = dateien.map(function (d) {
    if (!istErlaubt_(d.pfad)) throw fehler_('Diese Datei darf nicht geändert werden: ' + d.pfad);
    var blob = d.base64
      ? gh_('post', '/git/blobs', { content: d.base64, encoding: 'base64' })
      : gh_('post', '/git/blobs', { content: d.inhalt, encoding: 'utf-8' });
    return { path: d.pfad, mode: '100644', type: 'blob', sha: blob.sha };
  });
  var neuerBaum = gh_('post', '/git/trees', { base_tree: k.baum, tree: baum });
  var neu = gh_('post', '/git/commits', { message: nachricht, tree: neuerBaum.sha, parents: [k.sha] });
  gh_('patch', '/git/refs/heads/' + BRANCH, { sha: neu.sha, force: false });
  return neu.sha;
}

function veroeffentlichen_(a) {
  if (!a.dateien || !a.dateien.length) throw fehler_('Keine Änderungen zum Veröffentlichen.');
  var text = String(a.zusammenfassung || 'Homepage aktualisiert').replace(/\s+/g, ' ').slice(0, 200);
  var sha = commit_(a.basisSha, a.dateien, PRAEFIX + ' ' + text);
  return { ok: true, sha: sha, status: status_() };
}

function rueckgaengig_() {
  var k = kopf_();
  if (k.nachricht.indexOf(PRAEFIX) !== 0 || k.nachricht.indexOf(PRAEFIX + ' Rückgängig') === 0) {
    throw fehler_('Die letzte Änderung kam nicht von dieser Seite und kann hier nicht rückgängig gemacht werden.');
  }
  var eltern = gh_('get', '/git/commits/' + k.eltern[0].sha);
  var neu = gh_('post', '/git/commits', {
    message: PRAEFIX + ' Rückgängig: ' + k.nachricht.slice(PRAEFIX.length + 1),
    tree: eltern.tree.sha,
    parents: [k.sha]
  });
  gh_('patch', '/git/refs/heads/' + BRANCH, { sha: neu.sha, force: false });
  return { ok: true, status: status_() };
}

// ------------------------------------------------------------------ Claude

var SYSTEM = [
  'Du pflegst die Homepage des Landgasthofs Ostermünchen (bayerisches Wirtshaus).',
  'Der Wirt sagt dir in einfachen Worten, oft per Spracheingabe, was geändert werden soll.',
  'Du bekommst den bearbeitbaren Inhalt aller Seiten als nummerierte Textabschnitte (Segmente) und Bilder,',
  'dazu die Speisekarte als JSON. Antworte IMMER durch Aufruf des Werkzeugs „aenderungen“ – auch für Rückfragen – und schreibe keinen anderen Text.',
  '',
  'Regeln:',
  '- Ändere nur, was verlangt ist. Behalte Stil, Schreibweise und Aufbau der Seite bei.',
  '- Segment-Text darf nur diese Auszeichnungen enthalten: <br>, <strong>, <em>, <a href="...">. Sonst reiner Text.',
  '- Spracheingabe kann Hör- und Tippfehler enthalten: Gerichte, Namen und Zahlen sinnvoll und korrekt schreiben.',
  '- Preise in der Speisekarte sind Zahlen (z. B. 15.8). Gerichte über speisekarte_* mit Pfaden in das JSON ändern.',
  '- Ein Foto einer Tageskarte, das als neue Tageskarte gemeint ist → Typ „tageskarte“.',
  '- Andere Fotos können ein Bild ersetzen (bild_ersetzen) oder neu eingefügt werden (bild_einfuegen_nach).',
  '- Einfügen geht hinter einem Segment (segment) oder, wenn eine Seite keinen passenden Text hat, hinter einem Bild (bild).',
  '- Neue Texte: Absätze mit Leerzeile trennen.',
  '- Impressum und Datenschutzerklärung sind gesperrt. Wird danach gefragt: rueckfrage mit Hinweis, dass nur Andi diese ändert.',
  '- Ist die Anweisung unklar, mehrdeutig oder würde sie viel löschen: keine Änderungen, sondern eine kurze rueckfrage.',
  '- zusammenfassung: 1–3 kurze Sätze in einfachem Deutsch, was geändert wird (für einen Laien).',
  '- Datum heute: ' + Utilities.formatDate(new Date(), 'Europe/Berlin', 'dd.MM.yyyy') + '.'
].join('\n');

var WERKZEUG = {
  name: 'aenderungen',
  description: 'Liste der Änderungen an der Homepage, eine Zusammenfassung oder eine Rückfrage.',
  input_schema: {
    type: 'object',
    properties: {
      zusammenfassung: { type: 'string' },
      rueckfrage: { type: 'string', description: 'Nur setzen, wenn nichts geändert werden soll und eine Frage nötig ist.' },
      aenderungen: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            typ: { type: 'string', enum: ['text', 'einfuegen_nach', 'loeschen', 'bild_ersetzen', 'bild_einfuegen_nach', 'tageskarte',
                                          'speisekarte_setzen', 'speisekarte_einfuegen', 'speisekarte_loeschen'] },
            datei: { type: 'string', description: 'Seite, z. B. index.html (bei text/einfuegen_nach/loeschen/bild_*)' },
            segment: { type: 'integer', description: 'Nummer des Segments (text/einfuegen_nach/loeschen/bild_einfuegen_nach)' },
            bild: { type: 'integer', description: 'Nummer des Bildes (bild_ersetzen) – oder Einfügestelle hinter diesem Bild, wenn kein passendes Segment da ist (einfuegen_nach/bild_einfuegen_nach)' },
            foto: { type: 'integer', description: 'Nummer des mitgeschickten Fotos (0 = erstes)' },
            text: { type: 'string', description: 'Neuer Text (text/einfuegen_nach)' },
            pfad: { type: 'array', items: { type: ['string', 'integer'] }, description: 'Pfad im Speisekarten-JSON, z. B. ["rubriken",3,"gerichte",5,"preis"]' },
            index: { type: 'integer', description: 'Einfügeposition (speisekarte_einfuegen)' },
            wert: { description: 'Neuer Wert (speisekarte_setzen / speisekarte_einfuegen)' }
          },
          required: ['typ']
        }
      }
    },
    required: ['zusammenfassung', 'aenderungen']
  }
};

function vorschlag_(a) {
  if (!a.anweisung || !String(a.anweisung).trim()) throw fehler_('Bitte sagen oder schreiben, was geändert werden soll.');
  var inhalt = [];
  (a.fotos || []).slice(0, 4).forEach(function (f, i) {
    inhalt.push({ type: 'text', text: 'Foto ' + i + ':' });
    inhalt.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: f } });
  });
  inhalt.push({ type: 'text', text: 'Aktueller Inhalt der Homepage:\n' + JSON.stringify(a.inhalt) });
  inhalt.push({ type: 'text', text: 'Anweisung des Wirts:\n' + String(a.anweisung).slice(0, 4000) });

  var r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: { 'x-api-key': eig_('ANTHROPIC_KEY'), 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: MODELL,
      max_tokens: 8000,
      system: SYSTEM,
      tools: [WERKZEUG],
      tool_choice: { type: 'auto' },
      messages: [{ role: 'user', content: inhalt }]
    })
  });
  var code = r.getResponseCode();
  if (code === 401) throw fehler_('Claude-Zugang abgelehnt (API-Schlüssel prüfen).');
  if (code === 400 && /credit|balance/i.test(r.getContentText())) throw fehler_('Das Claude-Guthaben ist aufgebraucht. Bitte Andi Bescheid geben.');
  if (code >= 300) throw new Error('Claude ' + code + ': ' + r.getContentText().slice(0, 300));
  var antwort = JSON.parse(r.getContentText());
  var block = (antwort.content || []).filter(function (b) { return b.type === 'tool_use'; })[0];
  if (block) return { ok: true, vorschlag: block.input };
  // Ohne Werkzeug geantwortet: Text als Rückfrage zeigen
  var text = (antwort.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n').trim();
  if (text) return { ok: true, vorschlag: { zusammenfassung: '', aenderungen: [], rueckfrage: text.slice(0, 600) } };
  throw new Error('Keine verwertbare Antwort von Claude.');
}

// ------------------------------------------------------------------ Test im Editor

function testeEinrichtung() {
  ['PIN', 'ANTHROPIC_KEY', 'GITHUB_TOKEN'].forEach(eig_);
  Logger.log('GitHub: letzte Änderung „%s“', kopf_().nachricht);
  var r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', muteHttpExceptions: true, contentType: 'application/json',
    headers: { 'x-api-key': eig_('ANTHROPIC_KEY'), 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: MODELL, max_tokens: 20, messages: [{ role: 'user', content: 'Sag nur: Servus' }] })
  });
  Logger.log('Claude: %s %s', r.getResponseCode(), r.getContentText().slice(0, 200));
}
