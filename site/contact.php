<?php
/**
 * PickingFruits, Kontaktformular
 *
 * Versendet Anfragen aus den Kontaktformularen (Hero und Kontaktbereich)
 * per E-Mail. Läuft auf klassischem IONOS-Webspace mit PHP, kein Framework nötig.
 *
 * ──────────────────────────────────────────────────────────────
 *  >>> HIER ANPASSEN: Ziel- und Absenderadresse <<<
 *  EMPFAENGER : Postfach, das die Anfragen erhalten soll.
 *  ABSENDER   : MUSS eine Adresse auf @pickingfruits.de sein,
 *               sonst stuft IONOS die Mail als Spam ein oder
 *               verweigert den Versand. NICHT die Adresse des
 *               Absenders aus dem Formular verwenden.
 * ──────────────────────────────────────────────────────────────
 */
$EMPFAENGER = 'daniel@pickingfruits.de';
$ABSENDER   = 'daniel@pickingfruits.de';

// Erlaubte Themen aus dem Auswahlfeld (Wert => Text, der in der Mail erscheint).
// Muss zu den <option>-Werten in index.html passen.
$THEMEN = [
    'audit'     => 'Meine Anzeigen laufen, aber es ist mehr drin',
    'start'     => 'Ich will mit Google oder Meta Ads starten',
    'strategie' => 'Ich suche einen Partner für mein Wachstum',
    'wechsel'   => 'Ich möchte meine Betreuung wechseln',
    'sonstiges' => 'Etwas anderes',
];

// ---------------------------------------------------------------

// Erkennen, ob die Anfrage per JavaScript (fetch) kam
$istAjax = (
    isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest'
);

/**
 * Antwort senden: JSON für AJAX, sonst Redirect zurück zur Seite.
 */
function antworten($ok, $fehler = '', $istAjax = false)
{
    if ($istAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'error' => $fehler]);
    } else {
        $ziel = $ok ? 'index.html?sent=1#kontakt' : 'index.html?error=1#kontakt';
        header('Location: ' . $ziel);
    }
    exit;
}

// Nur POST zulassen
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    antworten(false, 'Methode nicht erlaubt.', $istAjax);
}

// Honeypot: Wenn das versteckte Feld ausgefüllt ist, war es ein Bot.
// Wir antworten bewusst mit "ok", damit der Bot keinen Fehler sieht.
if (!empty($_POST['company'])) {
    antworten(true, '', $istAjax);
}

// Eingaben einlesen und säubern
$name      = trim($_POST['name'] ?? '');
$email     = trim($_POST['email'] ?? '');
$thema     = trim($_POST['topic'] ?? '');
$website   = trim($_POST['website'] ?? '');
$nachricht = trim($_POST['message'] ?? '');

// Pflichtfelder prüfen (Nachricht und Website sind optional)
if ($name === '' || $email === '' || $thema === '') {
    http_response_code(422);
    antworten(false, 'Bitte fülle Name, E-Mail und Thema aus.', $istAjax);
}

// Thema nur aus der erlaubten Liste zulassen
if (!isset($THEMEN[$thema])) {
    http_response_code(422);
    antworten(false, 'Bitte wähle ein Thema aus.', $istAjax);
}

// E-Mail validieren
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    antworten(false, 'Bitte gib eine gültige E-Mail-Adresse an.', $istAjax);
}

// Schutz vor Header-Injection: keine Zeilenumbrüche in Kopfzeilen-Werten
$name    = str_replace(["\r", "\n"], ' ', $name);
$email   = str_replace(["\r", "\n"], ' ', $email);
$website = str_replace(["\r", "\n"], ' ', $website);

$themaText = $THEMEN[$thema];
$betreff   = 'Neue Anfrage: ' . $themaText;

// Nachricht zusammenbauen
$body  = "Neue Anfrage über das Kontaktformular von pickingfruits.de\n";
$body .= "----------------------------------------------------------\n\n";
$body .= "Name:     " . $name . "\n";
$body .= "E-Mail:   " . $email . "\n";
$body .= "Thema:    " . $themaText . "\n";
$body .= "Website:  " . ($website !== '' ? $website : 'nicht angegeben') . "\n\n";
$body .= "Nachricht:\n" . ($nachricht !== '' ? $nachricht : '(keine Nachricht)') . "\n\n";
$body .= "----------------------------------------------------------\n";
$body .= "Gesendet am " . date('d.m.Y H:i') . " Uhr\n";

// Kopfzeilen
$headers  = 'From: PickingFruits <' . $ABSENDER . ">\r\n";
$headers .= 'Reply-To: ' . $name . ' <' . $email . ">\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion();

// Versand. Der fünfte Parameter setzt den Envelope-Sender (wichtig
// für die Zustellbarkeit auf IONOS).
$erfolg = mail(
    $EMPFAENGER,
    '=?UTF-8?B?' . base64_encode($betreff) . '?=',
    $body,
    $headers,
    '-f' . $ABSENDER
);

if ($erfolg) {
    antworten(true, '', $istAjax);
} else {
    http_response_code(500);
    antworten(false, 'Die Nachricht konnte nicht gesendet werden.', $istAjax);
}
