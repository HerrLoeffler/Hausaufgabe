# Secure: gleiches Logo im Einstieg und App-Symbol

Task GC-IOS-02 / GC-RELEASE-06, Owner GC · iPhone & iPad, Chat01a10c75-8912-7a12-98f0-c9e78064aa2c. Folgeauftrag nach verfügbarem1321: Martin zeigt den alten runden Schlossbadge über der Code-/Namenseingabe. Gewählt ist das Schloss durch das C mit Secure-Schriftzug.

Ursache: prepare_assets.swift verwendet für AppIcon bereits Brand/SecureAppIcon.png, schreibt für GradeCrewLogo.imageset aber noch den alten generierten png-Badge. Kleine Korrektur: Live-Logo bekommt dieselben unveränderten freigegebenen Bytes; Test-Logo bleibt wie zuvor. Die bestehende In-App-Bildreferenz greift dadurch ebenfalls auf die gewählte Identität zu. Keine neue Grafik, keine Änderung der Eingabefelder, Kompaktansicht, Aufgabe, Uhr, AAC/Offline/Backend oder AppStore-Auswahl1293.

Echte Asset-Regressionsprüfung reproduziert die unterschiedlichen Bildhashes vor der Korrektur. Danach31Python- und29JS-Tests bestanden; tatsächliches Live-AppIcon, Live-Logo und freigegebene Quelldatei haben jeweils SHA256fa341d56873fdec36b57a316da5a78577fcdb9d163eeca5774b103b250cc172d. Separates Test-Symbol/Logo identisch untereinander und weiterhin unterschiedlich zumLive-Symbol. Unabhängiger enger Readonly-Review ohne P0–P2. Native Vorschau läuft noch. Erste CLI-Auswahl versehentlichPhonegerät für die iPad-basierte Smoke-Suite abgewiesen; mit vorgesehenem iPadgerät korrigiert, kein Produktfehler/kein falscher Pass.

Quelle: bestehender Releasebranch feature/secure-live-ready-20261026@f5721de36c6c0f23e53e1d541f953b3443381efc. Neuer Implementierungsbranchfix/secure-entry-logo-20261118; nur prepare_assets.swift, Verhaltenstest, kurzerPlan und dieseÜbergabe. Neues App-Binary erforderlich;1321bleibt bis dahin beim bisherigen In-App-Logo. Storelogo selbst bleibt unverändert.

Nächster Schritt: native Bildvorschau prüfen, dann genau einen neuen gated Secure-Live-TestFlight-Lauf über normale Integration starten. Keinen AppStoreReviewversand und keine separate Secure-Test-Auslieferung.

Native Vorschau auf schmaler320pt-Ansicht und Tablet geprüft:40/40 Layoutfälle sowie bestehende Lifecycle-/Abgabe-/Rückkehrprüfungen erfolgreich. Gerendertes Einstiegsbild zeigt die gewählte durch-C-Identität. Geometrie und Labels unverändert. Als nächster Schritt normale Integration vonPR446 und genau ein vorhandener Releaseworkflow; Upload weiterhin noch nicht gestartet.
