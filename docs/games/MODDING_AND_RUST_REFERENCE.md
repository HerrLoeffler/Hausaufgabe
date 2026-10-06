# Modding, Rust und Analysewerkzeuge: Einordnung für GradeCrew

Recherche 06.10.2026 · GC-GAMES-PIPELINE-01. Dokumentationswissen, keine Installation oder Freigabe zur Analyse fremder geschützter Inhalte. Bewertungskriterien: Nutzen für eigene kleine Lernspiele, Integrationsaufwand und Wartbarkeit. Bewertungen sind begründete Einschätzungen, keine Tool-Benchmarks.

## Ressourcen aus Martins Liste

| Quelle | Tatsächliche Aufgabe laut Originalprojekt | Konsequenz für uns |
| --- | --- | --- |
| [universal-modder](https://github.com/rehan-remade/universal-modder) | Skills, CLI und Abläufe für Änderungen bestehender PC-Spiele, einschließlich Generierung und Spieltests | Produktionsabläufe und überprüfbare Tests lernen; kein notwendiger Bestandteil eines neuen GradeCrew-Spiels. Der abgeschnittene Link `rehan-remade/unive` wurde über die Suche diesem passenden Repository zugeordnet, nicht als vollständiger Link behandelt. |
| [REA](https://github.com/morluto/rea) | Agentengestützte Untersuchung bestehender Anwendungen, von Verhalten bis Binärdateien | Bei einer konkreten autorisierten Analyse eventuell hilfreich. Keine eigene Spielengine, keine Zusage originalen Quellcode automatisch wiederherzustellen. |
| [AI Game Modding Guides](https://github.com/trevaintdead/ai-game-modding-guides) | Entwurfsleitfäden zu gekoppelten Spielen, Modding, Rust-Neuimplementierungen, Fehlersuche und Übergaben | STATUS/Handoff und reproduzierbare Fehlerberichte passen. Modding bestehender Spiele bleibt von Eigenentwicklung getrennt. Passender vollständiger Treffer zum verkürzten `trevaintdead/ai-ga`; Videobeschreibung nicht bestätigt. |
| [Ghidra MCP](https://github.com/bethington/ghidra-mcp) | Agentenzugang zu Ghidras Binäranalyse; auch schreibende Aktionen und Skripte | Spezialwerkzeug für Binäruntersuchung, nicht für Art Direction, Leveldesign oder gewöhnliche neue Spielmechanik. |
| [IDA MCP](https://github.com/HexRaysSA/ida-mcp) | Offizielle Hex-Rays-Anbindung für IDA | Ebenfalls Analysewerkzeug; setzt passende IDA-Umgebung voraus. Kein zusätzlicher Produktionsdienst nötig, solange kein konkreter Analysefall besteht. |
| [ILSpy](https://github.com/icsharpcode/ILSpy) | .NET-Decompiler | Könnte verwaltete Assemblies untersuchen; daraus entsteht nicht automatisch das originale Unity-Projekt mit Szenen und Assets. Für den vorliegenden Workflowauftrag nicht ausgeführt. |
| [Cpp2IL](https://github.com/SamboyCoding/Cpp2IL) | Rekonstruktion aus Unity-IL2CPP-Builds; Projekt bezeichnet sich als Work in Progress | Anderer technischer Fall als allgemeine C#-Quellenarbeit. Kein Anlass, es auf den gelieferten Mono-/Managed-Build anzuwenden. |
| [AnyPS5](https://github.com/boykopovar/AnyPS5) / [PortPS5](https://github.com/yuriolive/PortPS5) | Umsetzung vorhandener Konsolenprogramme auf andere Betriebssysteme, mit Kompatibilitätsgrenzen | Keine Werkzeuge, um unser eigenes Lernspiel „für PS5 zu exportieren“. Für unseren aktuellen Produktionsweg nicht erforderlich. |

Gemeinsame nützliche Idee: eine Behauptung braucht den passenden Prüfschritt. Ein Prozess, der startet, belegt keine korrekte Spielmechanik; ein schöner Screenshot belegt keine Reaktion auf Eingaben. [Universal-Modder-Testwissen](https://github.com/rehan-remade/universal-modder/blob/main/knowledge/techniques/oracles-how-agents-know-a-mod-works.md). Fehlermeldungen mit Version, Ausgangszustand, Handlung, erwartetem und tatsächlichem Ergebnis sowie letztem funktionierendem Stand dokumentieren. [Fehlersuche-Leitfaden](https://github.com/trevaintdead/ai-game-modding-guides/blob/main/guides/05-testing-and-troubleshooting.md).

Diese Werkzeuge werden nicht pauschal eingebunden. Unser Standard ist eigene Implementierung aus dokumentierten Anforderungen; fremde Spielassets oder dekompilierter Code werden nicht als frei verwendbare Vorlagen behandelt. Die Links sind Wissensquellen, keine Installationsaufträge.

## Rust verständlich eingeordnet

Rust ist eine Programmiersprache. [Bevy](https://bevy.org/) ist eine darin geschriebene Spielengine mit einem System aus Entitäten, Komponenten und verarbeitenden Funktionen (ECS), 2D-/3D-Darstellung und Animationsfunktionen. Rust allein liefert weder fertige Figuren noch ein gutes Spiel oder einen vollständigen Produktionseditor. Die [Rust-Rewrite-Leitfäden](https://github.com/trevaintdead/ai-game-modding-guides/blob/main/guides/03-rust-rewrites-and-ports.md) behandeln das Neuimplementieren vorhandener Engines und das Lesen vorhandener Spieldaten; das ist ein anderes Ziel als unser neues Lernspiel.

Für **kleine eigene GradeCrew-Spiele mit schneller visueller Iteration und Schulgeräten**: vorhandene passende Engine-/Framework-Pipeline **8/10**, Rust/Bevy als neuer Standard derzeit **5/10**. Erstere erlaubt uns, Aufwand auf Mechanik, Lernwirkung und Gestaltung zu konzentrieren. Rust/Bevy bietet kontrollierbaren, modularen Code, würde aber neue Build-, Integrations- und Inhaltsabläufe erfordern, ohne dass für unser konkretes Spiel schon ein Vorteil gemessen wurde. Das ist eine Bewertung unseres Einsatzfalls, keine allgemeine Abwertung von Rust.

Rust bleibt eine Option bei einem begründeten Spezialfall: vorhandene Rust-Kompetenz, ein passendes bestehendes Bevy-Projekt oder ein nachgewiesener technischer Bedarf. Dann dieselbe Referenzszene und Zielgerätematrix wie bei allen anderen Kandidaten prüfen. Kein Umschreiben eines funktionierenden Spiels nur wegen eines Videos; keine behauptete automatische Performanceverbesserung.

## Wissen auffindbar halten

Der Hauptworkflow verlinkt diese Referenz. Vor einer Aufgabe wird nur der passende Teil gelesen: neues Spiel → Briefing/Enginewahl; Asset → Art-/Exportregeln; Fehler → konkrete Prüfanleitung; zulässiges Modding → gesondert geprüfte Spezialwerkzeuge. Versionsabhängige Aussagen bei tatsächlicher Verwendung erneut am Originalprojekt prüfen. Fremde Skill-Dateien bleiben Referenzen, solange sie nicht gesondert geprüft und eingerichtet wurden.
