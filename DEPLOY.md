# PickingFruits: Veröffentlichung über GitHub Pages

Die Website liegt im Ordner **`site/`** und wird von GitHub Pages ausgeliefert. Jeder Push auf `main`, der etwas in `site/` ändert, veröffentlicht die Seite automatisch (Workflow `.github/workflows/deploy.yml`). Es sind keine Zugangsdaten, kein SFTP und kein Server bei IONOS mehr nötig. IONOS verwaltet nur noch Domain und E-Mail.

## Was im Ordner liegt

```
site/
├── index.html            Startseite (inkl. strukturierter Daten für Google und KI)
├── impressum.html        (noindex)
├── datenschutz.html      (noindex)
├── 404.html              Fehlerseite (GitHub Pages nutzt sie automatisch)
├── robots.txt            erlaubt Suchmaschinen und KI-Crawler
├── sitemap.xml
├── llms.txt              Kurzprofil für KI-Assistenten
├── favicon.ico
├── impressum/, datenschutz/, privacy-policy/, terms-and-conditions/, agb/
│                         Weiterleitungsseiten für alte WordPress-Adressen
├── css/styles.css
├── js/main.js
└── assets/               Bilder, Video, lokale Schriften, Logo, Favicons, Vorschaubild
```

## Einmalige Einrichtung (im Browser, dauert 10 Minuten)

**1. Formular-Dienst**
Das Kontaktformular wird über Formspree verschickt (kostenlos bis 50 Anfragen im Monat).
Konto auf formspree.io anlegen, neues Formular mit Ziel `daniel@pickingfruits.de` erstellen, die Formular-ID (8 Zeichen) in `site/index.html` an beiden Stellen `FORMSPREE_ID` eintragen.

**2. GitHub Pages einschalten**
Repository `rspbrry/pickingfruits-website` muss **öffentlich** sein (Settings > General > Danger Zone > Change visibility).
Dann: Settings > Pages > Build and deployment > Source: **GitHub Actions**.
Danach unter "Custom domain" `pickingfruits.de` eintragen und speichern. Den Haken **Enforce HTTPS** setzen, sobald er anklickbar ist (kann bis zu einer Stunde dauern, bis das Zertifikat da ist).

**3. DNS bei IONOS** (Domains & SSL > pickingfruits.de > DNS)
Die Mail-Einträge (MX, SPF, DKIM, DMARC, autodiscover) **nicht anfassen**. Folgende Einträge anlegen:

| Typ   | Hostname | Wert                     |
|-------|----------|--------------------------|
| A     | @        | 185.199.108.153          |
| A     | @        | 185.199.109.153          |
| A     | @        | 185.199.110.153          |
| A     | @        | 185.199.111.153          |
| CNAME | www      | rspbrry.github.io        |

Falls noch alte A- oder AAAA-Einträge für `@` oder `www` existieren (217.160.x.x oder 2001:8d8:...), diese löschen.

**4. Veröffentlichen**
Reiter "Actions" > "Website veröffentlichen (GitHub Pages)" > "Run workflow". Nach etwa einer Minute ist die Seite unter `https://rspbrry.github.io/pickingfruits-website/` sichtbar, nach DNS-Übernahme (meist 10 bis 60 Minuten) unter `https://pickingfruits.de`.

**5. Prüfen**
- `https://pickingfruits.de` zeigt die neue Seite, `www.` leitet auf die Hauptdomain um.
- Formular absenden: Kommt die Mail an (auch Spam prüfen)? Beim ersten Versand verlangt Formspree eine einmalige Bestätigung per E-Mail.
- Handy: Layout, Video starten, Menü, Schnellzugriff unten.
- `/impressum/` und `/datenschutz/` leiten weiter, `/irgendwas` zeigt die 404-Seite.

**6. Google informieren**
- Google Search Console: Domain-Property anlegen, `sitemap.xml` einreichen, Startseite per "URL prüfen" zur Indexierung anfordern.
- Google-Unternehmensprofil und Instagram-Bio: Website-Adresse auf `https://pickingfruits.de`.

**7. Aufräumen bei IONOS und GitHub**
- GitHub: Settings > Secrets and variables > Actions: die vier `SFTP_*`-Geheimnisse löschen (werden nicht mehr gebraucht).
- IONOS: den für den alten Upload angelegten SFTP+SSH-Zugang löschen. Das WordPress-Projekt kann liegen bleiben; der Tarif lässt sich später über den IONOS-Support auf Domain + E-Mail verkleinern.

## Pflege

- **Inhalte ändern:** Datei in `site/` bearbeiten, committen, pushen. Fertig.
- **FAQ, Leistungen oder Kontaktdaten ändern:** danach `python3 tools/build_schema.py` ausführen, damit die strukturierten Daten zur sichtbaren Seite passen.
- **Vorstellungsvideo tauschen:** `site/assets/hero-video.mp4` und `site/assets/hero-poster.jpg` ersetzen (am besten 720p, H.264, 1 bis 3 MB).
- **Kundenstimmen:** In `index.html` den auskommentierten Block "KUNDENSTIMMEN" aktivieren.
- **Hinweis:** GitHub Pages kennt keine `.htaccess`. Weiterleitungen sind kleine HTML-Seiten (siehe Ordnerliste), HTTPS und www-Umleitung macht GitHub selbst.

## Version 2.0 (nach dem Release)

- Meta-Pixel und/oder Google-Tag **zusammen mit** einem Einwilligungs-Banner einbauen (vor dem Schalten von Werbung).
- Danke-Seite nach dem Absenden des Formulars als Conversion-Ereignis.
- Buchungslink (z. B. Cal.com) neben WhatsApp.
- Weitere Cases, Vorstellungsvideo, Kundenstimmen.
