# Prüfnotiz: Markt- und Fachdidaktikrecherche 22.10.2026

Task GC-EXTENDED-QUESTION-TYPES-01. Recherche- und Konzeptdaten; kein Produktcode.

## Tatsächlich geprüft

- 148 eindeutige Quellen-IDs und 163 eindeutige Aufgaben-IDs, alle referenzierten Quellen auflösbar.
- Alle Wiederverwendungs-IDs liegen in VIS01–VIS13, EXP01–EXP05 oder MOD01–MOD08.
- Prioritäten: 114 P1 / 49 P2; keine Implementierungsfreigabe aus diesen Kategorien.
- 20 vorgeschlagene Referenz-IDs existieren; Quellen-/Curriculumevidenz und eigener Aufgabenentwurf getrennt.
- Fachreview mit gezielten Originalquellen-Nachprüfungen; Synthesereview gegen den tatsächlichen Katalog.
- Excel: alle drei Blätter gerendert, native Tabellen/AutoFilter und eingefrorene Kopfzeilen/IDs geprüft; Export/Wiederimport erhält sämtliche IDs und Quellenbezüge. Zählformeln gegen JSON abgeglichen, keine gefundenen Formelfehler.
- PDF-Synthese wird als gesonderte lesbare Ausgabe mit klickbaren Quellen und visueller Layoutprüfung geliefert. Die kanonischen fachlichen Daten dieses Branches sind Markdown und JSON.
- Kein vollständiger Nutzungstest externer angemeldeter/bezahlter Produkte, keine umfassende Genauigkeitsmessung und keine empirische Wirksamkeitsstudie.

## Aufgelöste fachliche Befunde

# Umsetzung des Inhaltsreviews

Stand: 22.10.2026. Neun konkrete Korrekturen aus review_content.md umgesetzt; keine neue Task-ID oder Produktimplementation.

- **PHY06:** ein vollständiges nicht degeneriertes Strahlenpaar als grundsätzlich bestimmend für die ideale Spiegelgerade behandelt; weitere Strahlen als Konsistenzprüfung, Sonderfälle explizit.
- **BIO03:** relative Innen-/Außenosmolarität, Wasserpermeabilität und anfänglicher Druck für das Lehrbeispiel konkretisiert.
- **SOC28:** H statt D; symbolische Transformation automatisch, freie Regelerklärung rubrikgestützt.
- **SOC40:** H statt D; Simulation/Testausgaben automatisch, Hypothesen-/Prozessbegründung offen.
- **S15:** unbelegten Januar-2026-Updatehinweis durch sichtbare Veröffentlichung 13.03.2023 plus Prüfdatum ersetzt.
- **SOC32:** als eigener fachlicher Transfer ohne direkten Produktbeleg markiert; unpassenden alleinigen S15-Verweis entfernt.
- **S11:** sichtbare CC BY-NC-ND 4.0 präzisiert, separate Medien-/Codeprüfung beibehalten.
- **S33:** ab 13, Ausbildungsabgleich ab Klasse 8, Studium ab Klasse 10 und dokumentierte Screenreader-/Brailleeinschränkung ergänzt.
- **L12:** ungeprüfte Kids-/Primarstufenabdeckung aus belegtem Stufenfeld entfernt und als Recherchegrenze in Zugangsnotiz geführt.

Bestätigte Befunde bleiben erhalten: aktuelle PhET-Regular-HTML-Lizenz CC BY-NC 4.0; aktuelle FWU-Zuordnung von LEIFIphysik/LEIFIchemie. Fachbelege und genaue Reviewargumente stehen in review_content.md.

Validierung: drei JSON-Dateien erneut geparst; betroffene IDs und Bewertungsmodi geprüft.

Abgeleitete Zählung konsistent aktualisiert: SOC jetzt 39 H / 8 L / 3 D. Ergänzung separat in supplementary_ideas.json: 10 neue Quellen U01–U10, 14 eigene Ideen SUP01–SUP14; Quellen-IDs und fehlende URL-Duplikate geprüft.


## Aufgelöste Synthesebefunde

1. Grundpreis/Achsenabschnitt und Kilometerpreis/Steigung im Taximodell korrekt getrennt.
2. Zellzyklus/Checkpointregulation als tatsächlich ergänzte Biologiemuster genannt; Körperregelkreise als verbleibende Lücke.
3. Revision liefert Hinweise auf Verständnis; selbstständiger Transfer als zusätzlicher Nachweis.
4. SUP08/SUP09 als konkrete Hörform-/Ensembleentwürfe dargestellt; Medienauswahl und Erprobung bleiben offen.
5. U01–U10 unmittelbar verlinkt; U08–U10 ausdrücklich Curriculum-/Berufsbelege für eigene digitale Transfers.
6. Erste 20 Referenzaufgaben verbreitert: SUP07 ersetzt SOC42, da PHY05 bereits elektrische Diagnose abdeckt.

## Strukturvalidierung

```json
{
  "source_count": 148,
  "idea_count": 163,
  "references_resolved": true,
  "unique_ids": true,
  "recommended_ids_valid": true,
  "source_categories": {
    "market_or_subject_source": 138,
    "curriculum_reference": 3,
    "quality_framework": 7
  },
  "priority_counts": {
    "P1": 114,
    "P2": 49
  },
  "json_sha256": "0659d980909125d62ab2f99f60f1b74da31ce904b04c56d8f7c6f0b0675bcc05",
  "report_words": 5966,
  "synthesis_review_resolved": true
}
```
