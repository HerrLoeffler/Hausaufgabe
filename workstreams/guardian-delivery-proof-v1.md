# Guardian: tatsächliche Lieferung geänderter Dateien

Nachprüfung von GC-AUTOMATION-04/05, Branch `fix/guardian-delivery-proof-v1` → main. Basis nach PR #57/#58: `9b29fb865029ee73fdafee8afab3f2c27a0d9d09`.

Bei der Abschlussprüfung wurde eine weitere Lücke erkannt: Ein beliebiges geändertes JS/CSS/HTML kann als Git-Commit integriert sein, ohne dass der bestehende Hosting-Builder diese Datei kopiert. Ein Receipt mit richtigem SHA allein bestätigt dann nicht die Lieferung dieser Änderung.

Korrektur: V2 bearbeitet bestehende Module; neue Module benötigen erst ausdrückliche Build-Anbindung. Unveränderte Modell-Dateien werden aus dem Kandidaten entfernt. Der Publisher bindet die tatsächlich geänderten Pfade. Nach isolierter Combined CI wird der originale unveränderte Kandidat zusätzlich verpackt. Root-eigene Prüflogik prüft Projekt/SHA, jeden geänderten Pfad im Release-Manifest, physische Datei und tatsächlichen Dateihash sowie die Syntax aller geänderten JS/MJS. Ohne genau diese Dateiliste können weder bezahlte Reviews noch Integration starten. Rehearsal ist ausdrücklich kein promotionfähiger Task-Nachweis.

82 lokale Verhaltenstests einschließlich Phantom-Datei, falschem Package-/Commit-/Projekt-/Hash-Nachweis, fehlender Datei, Traversal/Symlink und altem vierfeldrigem Testnachweis grün. Fünf zusätzliche CLI-Tests erzeugen echte Git-Kandidaten und physische Pakete; darunter explizite Modul-Syntaxprüfung und Rehearsal ohne Promotionsnachweis. Syntaxfehler lösen begrenzte Reparatur mit erhaltenem Diagnosehinweis aus; fehlende Build-Anbindung bleibt ein Setup-Blocker. Finalen GitHub-Lauf und tatsächlichen isolierten PR-Rehearsal separat prüfen. Policy bleibt deaktiviert, Credentials fehlen, keine bezahlten Modellaufrufe/Produktintegration/Production-Änderung durch diese Nachprüfung.

Nächster Schritt: Fix nach grüner CI integrieren, Übergabe/TODO sichern; danach weiterhin sichere Keys-/Flags-Einrichtung und ein realer kleiner Pilot nach `docs/AUTOMATION_SETUP.md`.

Nachprüfung am 04.10.2026: finaler Head `07d0dab25694e58c95922d7878a5819f8d29c774`, Guardian-/Handoff-/Development-Checks und isolierte Rehearsal `37085700180` erfolgreich. PR #59 integriert, Merge `a2f6c2daed6bebca87f6365602012c57d24c93e7`. Weiterführung mit drei unabhängigen Prüfern: `workstreams/guardian-three-reviewers-v1.md`.
