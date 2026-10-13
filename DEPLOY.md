# PickingFruits: Release-Anleitung (IONOS)

Die fertige Website liegt im Ordner **`site/`**. Dessen **Inhalt** (nicht der Ordner selbst) kommt per SFTP ins Hauptverzeichnis der Domain. Zugangsdaten bleiben bei dir und gehören nie in den Code.

## Was im Ordner liegt

```
site/
├── index.html            Startseite (inkl. strukturierter Daten für Google und KI)
├── impressum.html        (noindex)
├── datenschutz.html      (noindex)
├── 404.html              Fehlerseite
├── contact.php           Mailversand des Formulars
├── robots.txt            erlaubt Suchmaschinen und KI-Crawler
├── sitemap.xml
├── llms.txt              Kurzprofil für KI-Assistenten
├── favicon.ico
├── .htaccess             HTTPS, www-Weiterleitung, alte WordPress-URLs, Caching (versteckte Datei!)
├── css/styles.css
├── js/main.js
└── assets/               Bilder, Video, lokale Schriften, Logo, Favicons, Vorschaubild
```

Wichtig: `.htaccess` ist eine **versteckte Datei**. Im FTP-Programm "versteckte Dateien anzeigen" aktivieren, sonst wird sie nicht hochgeladen.

## Release in 6 Schritten

**1. Sicherung der alten WordPress-Seite (Rückweg)**
Alle Dateien per SFTP herunterladen und die Datenbank im IONOS-Menü exportieren. Beides sicher ablegen.

**2. Testaufbau auf einer Subdomain**
Im IONOS-Menü eine Subdomain anlegen, z. B. `test.pickingfruits.de`, mit eigenem Zielordner. Den Inhalt von `site/` dorthin hochladen und danach die Datei `tools/robots-staging.txt` als `robots.txt` darüberspielen (damit der Test nicht bei Google landet).

**3. Testen (am echten Server)**
- Formular absenden: Kommt die Mail bei daniel@pickingfruits.de an (auch Spam prüfen)?
- Handy (iPhone und Android): Layout, Video starten, Menü, Schnellzugriff unten.
- Links: WhatsApp, Telefon, Impressum, Datenschutz.
- `https://test.pickingfruits.de/llms.txt` und `/sitemap.xml` öffnen.

**4. Umschalten**
Alte WordPress-Dateien in einen Ordner `wordpress-alt` verschieben (nicht löschen). Danach den Inhalt von `site/` (mit `.htaccess`, **ohne** die Staging-robots) ins Hauptverzeichnis laden. Prüfen: `https://pickingfruits.de` zeigt die neue Seite, `http://` leitet auf `https://` um, `www` leitet auf die Hauptdomain um, `/impressum` leitet auf `/impressum.html`.
Falls der Server nach dem Upload einen Fehler 500 zeigt: In `.htaccess` die Blöcke einzeln auskommentieren (zuerst `mod_expires`, dann `mod_headers`), vermutlich verbietet der Tarif eine davon.

**5. Google informieren**
- Google Search Console: Domain-Property anlegen und bestätigen, `sitemap.xml` einreichen, die Startseite per "URL prüfen" zur Indexierung anfordern.
- Google-Unternehmensprofil: Website-Adresse auf `https://pickingfruits.de` setzen, Profil prüfen (siehe Empfehlung unten).
- Instagram-Profil: Link in der Bio auf die Website.

**6. Nacharbeit**
Formular ein letztes Mal live testen, Testsubdomain löschen, nach 1 bis 2 Tagen in der Search Console prüfen, ob die Seite erkannt wurde.

## Pflege

- **FAQ, Leistungen oder Kontaktdaten ändern:** danach im Projektordner `python3 tools/build_schema.py` ausführen, damit die strukturierten Daten zur sichtbaren Seite passen.
- **Vorstellungsvideo tauschen:** `site/assets/hero-video.mp4` und `site/assets/hero-poster.jpg` ersetzen (am besten 720p, H.264, 1 bis 3 MB).
- **Kundenstimmen:** In `index.html` den auskommentierten Block "KUNDENSTIMMEN" aktivieren.

## Version 2.0 (nach dem Release)

- Meta-Pixel und/oder Google-Tag **zusammen mit** einem Einwilligungs-Banner einbauen (vor dem Schalten von Werbung).
- Danke-Seite nach dem Absenden des Formulars als Conversion-Ereignis.
- Buchungslink (z. B. Cal.com) neben WhatsApp.
- Weitere Cases, Vorstellungsvideo, Kundenstimmen.
