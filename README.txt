MEINE IMMOBILIEN – NETLIFY STARTER
=================================

WICHTIG
Diese ZIP-Datei ist eine erste, noch nicht vollständig eingerichtete Web-App.
Sie ist kein fertiger, geprüfter Produktivbetrieb. Bevor echte Mieterdaten
eingetragen werden, müssen Supabase, Zugriffsrechte und Backups eingerichtet
und getestet werden.

ENTHALTEN
- Immobilien anlegen
- Wohnungen zu Immobilien hinzufügen
- Mieter erfassen
- Einnahmen und Ausgaben erfassen
- PWA-Grundgerüst für iPhone
- Supabase-Datenbankschema mit Row Level Security

1) NETLIFY VERÖFFENTLICHEN
- ZIP entpacken.
- Netlify öffnen: https://app.netlify.com/drop
- Den entpackten Ordner mit index.html, app.js usw. auf die Seite ziehen.
- Netlify erzeugt eine Website-Adresse.

2) SUPABASE EINRICHTEN
- Kostenloses Projekt auf https://supabase.com anlegen.
- Im Projekt unter SQL Editor die Datei supabase_schema.sql vollständig ausführen.
- Unter Project Settings > API die Project URL und den anon/public key kopieren.
- In app.js die beiden Werte SUPABASE_URL und SUPABASE_ANON_KEY ersetzen.
- Danach den Ordner erneut auf Netlify Drop ziehen, damit die aktualisierte Version live geht.

3) ANMELDUNG
- App öffnen und „Konto erstellen“ wählen.
- Für den zweiten Nutzer ein eigenes Konto erstellen.

WICHTIG ZUR GEMEINSAMEN NUTZUNG:
Das mitgelieferte SQL-Schema schützt Daten zunächst pro Benutzer. Es stellt
noch KEINE gemeinsame Freigabe zwischen zwei Konten bereit. Die zweite Person
sieht daher nicht automatisch die Daten des ersten Kontos.
Bevor beide Nutzer denselben Datenbestand verwenden, muss eine sichere
Mitglieder-/Haushaltsfreigabe mit passenden RLS-Regeln ergänzt und getestet
werden. Nicht durch Abschalten der Sicherheit oder Weitergabe des
Service-Role-Schlüssels umgehen. Der Service-Role-Schlüssel gehört niemals
in app.js oder in eine öffentliche Website.

KOSTEN
Netlify und Supabase haben kostenlose Einstiegstarife mit Nutzungsgrenzen.
Kostenlosigkeit und Verfügbarkeit sind nicht garantiert; Limits und Tarife
können sich ändern. Prüfe die aktuellen Tarifbedingungen beider Anbieter.
Keine kostenpflichtigen Funktionen aktivieren.

DATENSCHUTZ / SICHERHEIT
- Noch keine Dokumenten- oder Foto-Uploads in dieser Version.
- Keine echten sensiblen Mieterdaten eintragen, bevor Zugriffsschutz,
  Mitgliederfreigabe, Backups und Datenschutz geprüft sind.
- Öffentliche anon-Schlüssel dürfen im Frontend stehen, wenn RLS korrekt
  eingerichtet ist. Niemals den Supabase service_role key veröffentlichen.
- Diese Starterversion ist nicht sicherheitsgeprüft und keine Rechtsberatung.

WEITERER AUSBAU
Zählerstände, Fotos, Dokumente, Schäden/Reparaturen, Abrechnungen,
Rollen (Administrator / Mitarbeiter / nur Lesen), Export und Backups.
