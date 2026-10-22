# GC-IOS-02 / GC-RELEASE-06 — Secure auf iPhone und iPad

Direkter Auftrag von Martin: bestehende Secure-App auch am iPhone nutzbar machen und über TestFlight testen, iPad-Verhalten erhalten. Ausführender Native-Fachchat dieses Gesprächs; Chatlink unbekannt. Keine zweite App/Bundle-ID, kein Website-/Backend-/Domain-Cutover. Basis acb7060c90a601feec28f49b22f6e9990f8e696a; eigener Branch feature/secure-iphone-20261022 im bereits isolierten eigenen Checkout /private/tmp/gc-material-rights-native-20261021. Frischer main970db46/Einstieg/STATE/TODO/Registry und Development Status39820706574success geprüft. Offene Domain-PR282 betrifft Websiteintegration, keine konkurrierende Native-PR. Initialer Sandbox-Fetch fehlgeschlagen, autorisiert eskalierter Fetch erfolgreich, eigener Branch anschließend fast-forward auf tatsächlichen Zielstand; keine fremde Arbeit zurückgesetzt.

## Umsetzung und Prüfziel

Eine universelle App de.gradecrew.secure für Gerätefamilien1/2 ab iOS/iPadOS17. Bestehende iPad-Orientierungen erhalten, iPhone Hoch-/Querformat. AAC, Prüfungsserver, Antworten, Zeitlimit, verschlüsselte lokale Queue und Receipt-/Freigabepolitik bleiben gleich. Gerätehinweise verwenden „Gerät“ statt iPad. Neue Phone-Matrix separat zusätzlich zu unveränderten900Native-/2x360Web-iPad-Gates: sechs Telefonansichten (375x667,390x844,430x932,667x375,844x390,390x300), drei Textgrößen, alle Zustände/Fragentypen und tatsächliche Navigation. Neuer eigener iPhone-Simulatorjob blockiert Upload bis Erfolg. Distribution prüft beide Gerätefamilien im signierten Artefakt neben AAC/Profil.

## Bisherige Belege / Checkpoint

Neue Tests zuerst rot: fehlende Phone-Abdeckung und fehlende universelle Distribution-Garantie. Nach Umsetzung22Pythonprüfungen bestanden; bestehende28Swiftprüfungen für Timer/Queue/Policy ebenfalls bestanden. Node-Aufruf zunächst mangels PATH nicht gestartet, gebündelter Node wird verwendet. Eigener Phone-Simulator53F3E226-D523-4F00-9E56-7325D82EA16E; echte SwiftUI-/WebKit-/Controller-/UI-Prüfung läuft lokal unter /private/tmp/gc-secure-iphone-layout-20261022, Prozesssession44305. Nur iOS27Runtime vorhanden; kein tatsächlicher AAC-/Telefonanruf-/Gerätebeleg. Noch kein Commit/PR/Upload oder erfolgreicher kompletter Matrixlauf behauptet.

## Assurance und Grenzen

SEC14/PRIV13: neue Geräteanbindung und schmale/Keyboard-/Großschriftansichten benötigen echte Layout-/Interaktionsbelege. SEC08/11: vorhandene AAC-/Timer-/Durable-Abgabe-Guards nicht umgehen; echte Sperre am physischen iPhone bleibt Nutzerabnahme. Keine neuen SDKs, Datenkategorien oder Berechtigungen; PRIV07/17 keine neuen Datenflüsse. Ein Simulator darf keine echte Sperre vortäuschen. Requested Modell unverändert, actual unbekannt, kein bezahlter Providerstart. gradecrew.de bleibt unverifizierte spätere URL-Abhängigkeit; Keychain-/Queue-/ProjektIDs erhalten.

Nächster Schritt: lokale echte Phone-Matrix auswerten, konkrete Layoutfehler beheben und unveränderlichen Diff unabhängig reviewen; danach bestehende TestFlightpipeline einmal mit frischem Zielabgleich starten.
