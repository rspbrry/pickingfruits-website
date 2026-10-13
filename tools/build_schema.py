#!/usr/bin/env python3
"""
Erzeugt die strukturierten Daten (JSON-LD) für site/index.html.

Die FAQ-Fragen und Antworten werden direkt aus dem sichtbaren HTML gelesen,
damit Seite und strukturierte Daten immer exakt übereinstimmen
(Suchmaschinen verlangen das).

Aufruf (im Projektordner):
    python3 tools/build_schema.py

Danach die Seite neu hochladen. Das Skript muss nur erneut laufen, wenn sich
FAQ-Texte, Leistungen oder Kontaktdaten ändern.
"""
import json
import re
import html
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"
INDEX = SITE / "index.html"
BASE = "https://pickingfruits.de"

# ---- Stammdaten (hier pflegen) ------------------------------------------------
NAME = "PickingFruits"
OWNER = "Daniel Wolff"
EMAIL = "daniel@pickingfruits.de"
PHONE = "+49 155 60915607"
SLOGAN = "Marken wachsen lassen, nicht nur Kampagnen schalten."
DESCRIPTION = (
    "PickingFruits ist die persönliche Marketing-Beratung von Daniel Wolff für "
    "Online-Shops und Marken: Google Ads, Meta Ads, Audit, Strategie und Wachstumsplan. "
    "Die Alternative zur klassischen Marketing-Agentur, mit einem festen Ansprechpartner."
)
ADDRESS = {
    "@type": "PostalAddress",
    "streetAddress": "Hauptstraße 3a",
    "postalCode": "01097",
    "addressLocality": "Dresden",
    "addressRegion": "Sachsen",
    "addressCountry": "DE",
}
# Profile der Marke (Unternehmen) und der Person getrennt pflegen
SAME_AS_ORG = ["https://www.instagram.com/pickingfruits.de/"]
SAME_AS_PERSON = ["https://www.linkedin.com/in/daniel-wolff-24452196/"]
KNOWS_ABOUT = [
    "Google Ads", "Meta Ads", "Facebook Ads", "Instagram Ads", "TikTok Ads",
    "Performance Marketing", "Marketing-Strategie", "E-Commerce Marketing",
    "Tracking und Attribution", "Marken-Wachstum",
]
SERVICES = [
    ("Google Ads Betreuung",
     "Aufbau, Betreuung und Skalierung von Google-Ads-Konten mit sauberer Kampagnenstruktur "
     "nach Profitgruppen und getrenntem Markenanteil."),
    ("Meta Ads und TikTok Ads",
     "Meta Ads (Facebook und Instagram) als Media Buyer inklusive Beratung zu den Creatives; "
     "TikTok Ads gemeinsam beraten und skalieren."),
    ("Audit, Strategie und Wachstumsplan",
     "Tiefes Audit mit Zugriff auf Google und Meta, Auswertung und ein Wachstumsplan mit Fokus und Kanalmix."),
    ("Tracking und Attribution",
     "Beratung zu Tracking und Attribution: Wo kommen Kunden wirklich her und welche Tools helfen dabei."),
]
# --------------------------------------------------------------------------------


def clean(fragment: str) -> str:
    """HTML-Tags entfernen, Entities auflösen, Leerraum glätten."""
    text = re.sub(r"<[^>]+>", "", fragment)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def read_faq(page: str):
    items = []
    for block in re.findall(r'<details class="faq">(.*?)</details>', page, flags=re.S):
        q = re.search(r"<summary>(.*?)</summary>", block, flags=re.S)
        a = re.search(r"<p>(.*?)</p>", block, flags=re.S)
        if q and a:
            items.append((clean(q.group(1)), clean(a.group(1))))
    return items


def build(faq):
    org_id, person_id = f"{BASE}/#organization", f"{BASE}/#daniel-wolff"
    site_id, page_id = f"{BASE}/#website", f"{BASE}/#webpage"
    logo = {
        "@type": "ImageObject", "@id": f"{BASE}/#logo",
        "url": f"{BASE}/assets/icon-512.png", "contentUrl": f"{BASE}/assets/icon-512.png",
        "width": 512, "height": 512, "caption": NAME,
    }
    og_image = {
        "@type": "ImageObject", "@id": f"{BASE}/#primaryimage",
        "url": f"{BASE}/assets/og-image.jpg", "contentUrl": f"{BASE}/assets/og-image.jpg",
        "width": 1200, "height": 630,
    }

    graph = [
        {
            "@type": "WebSite", "@id": site_id, "url": f"{BASE}/",
            "name": NAME, "alternateName": ["Picking Fruits", "PickingFruits Marketing-Beratung"],
            "description": DESCRIPTION, "inLanguage": "de-DE",
            "publisher": {"@id": org_id},
        },
        {
            "@type": "ProfessionalService", "@id": org_id,
            "name": NAME, "legalName": f"{OWNER} PickingFruits",
            "alternateName": "Picking Fruits",
            "url": f"{BASE}/", "logo": logo, "image": og_image,
            "description": DESCRIPTION, "slogan": SLOGAN,
            "email": EMAIL, "telephone": PHONE, "vatID": "DE348561009",
            "address": ADDRESS,
            "areaServed": {"@type": "Country", "name": "Deutschland"},
            "founder": {"@id": person_id}, "employee": {"@id": person_id},
            "foundingDate": "2024-11",
            "knowsAbout": KNOWS_ABOUT,
            "sameAs": SAME_AS_ORG,
            "contactPoint": [{
                "@type": "ContactPoint", "contactType": "customer service",
                "email": EMAIL, "telephone": PHONE,
                "availableLanguage": ["de"], "url": f"{BASE}/#kontakt",
            }],
            "hasOfferCatalog": {
                "@type": "OfferCatalog", "name": "Leistungen von PickingFruits",
                "itemListElement": [
                    {"@type": "Offer", "itemOffered": {
                        "@type": "Service", "name": n, "description": d,
                        "provider": {"@id": org_id},
                        "areaServed": {"@type": "Country", "name": "Deutschland"},
                    }} for n, d in SERVICES
                ],
            },
        },
        {
            "@type": "Person", "@id": person_id, "name": OWNER,
            "jobTitle": "Berater für Google Ads, Meta Ads und Marken-Wachstum",
            "description": (
                "Google Ads Specialist in einer deutschen Performance-Marketing-Agentur und "
                "freiberuflicher strategischer Berater für Online-Shops und Marken. Gründer von PickingFruits."
            ),
            "image": f"{BASE}/assets/daniel.jpg", "url": f"{BASE}/#ueber-mich",
            "email": EMAIL, "worksFor": {"@id": org_id},
            "knowsAbout": KNOWS_ABOUT, "sameAs": SAME_AS_PERSON,
            "homeLocation": {"@type": "Place", "address": {
                "@type": "PostalAddress", "addressLocality": "Dresden", "addressCountry": "DE"}},
        },
        {
            "@type": "WebPage", "@id": page_id, "url": f"{BASE}/",
            "name": "PickingFruits | Google Ads & Meta Ads Marketing-Beratung",
            "description": DESCRIPTION, "inLanguage": "de-DE",
            "isPartOf": {"@id": site_id}, "about": {"@id": org_id},
            "primaryImageOfPage": {"@id": f"{BASE}/#primaryimage"},
            "image": og_image,
        },
    ]
    if faq:
        graph.append({
            "@type": "FAQPage", "@id": f"{BASE}/#faq", "isPartOf": {"@id": page_id},
            "mainEntity": [
                {"@type": "Question", "name": q,
                 "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq
            ],
        })
    return {"@context": "https://schema.org", "@graph": graph}


def main():
    page = INDEX.read_text(encoding="utf-8")
    faq = read_faq(page)
    data = json.dumps(build(faq), ensure_ascii=False, indent=2)
    # "</" in JSON innerhalb von <script> sicher machen
    data = data.replace("</", "<\\/")
    block = f'<script type="application/ld+json" id="schema-jsonld">\n{data}\n</script>'
    new, n = re.subn(
        r'<script type="application/ld\+json" id="schema-jsonld">.*?</script>',
        lambda m: block, page, count=1, flags=re.S,
    )
    if n != 1:
        raise SystemExit("Platzhalter <script id=\"schema-jsonld\"> in index.html nicht gefunden.")
    INDEX.write_text(new, encoding="utf-8")
    print(f"Strukturierte Daten geschrieben ({len(faq)} FAQ-Einträge, {len(SERVICES)} Leistungen).")


if __name__ == "__main__":
    main()
