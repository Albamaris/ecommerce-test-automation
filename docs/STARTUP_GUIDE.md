# Jenkins CI/CD - Startup Guide

## Nach PC-Neustart: So starten Sie Jenkins

### Schritt 1: Docker Desktop starten
1. Öffnen Sie **Docker Desktop**
2. Warten Sie, bis Docker vollständig gestartet ist (grünes Symbol)

### Schritt 2: Jenkins Container starten
Öffnen Sie ein Terminal (PowerShell oder CMD) und navigieren Sie zum Projekt:

```bash
cd C:\Projects\ecommerce-test-automation
```

Starten Sie Jenkins:

```bash
docker compose up -d
```

**Ausgabe sollte sein:**
```
[+] Running 3/3
 ✔ Network ecommerce-test-automation_jenkins    Created
 ✔ Container jenkins-docker                            Started
 ✔ Container jenkins-playwright                        Started
```

### Schritt 3: Warten auf Jenkins (30-60 Sekunden)
Jenkins braucht etwas Zeit zum Starten. Warten Sie ca. 30-60 Sekunden.

### Schritt 4: Jenkins öffnen
Öffnen Sie in Ihrem Browser:

```
http://localhost:8080
```

**Keine Anmeldung erforderlich** - Sie kommen direkt zur Jenkins-Oberfläche.

### Schritt 5: Tests ausführen
1. Klicken Sie auf Ihren Job: **"Playwright E2E Tests"**
2. Klicken Sie auf **"Build with Parameters"**
3. Wählen Sie die gewünschten Browser und Worker-Anzahl
4. Klicken Sie auf **"Build"**

---

## Jenkins Jobs

Es gibt **zwei Jenkins Jobs** in diesem Setup:

### 1. Playwright E2E Tests (Hauptjob)
- **Zweck**: Führt die Playwright-Tests aus
- **Trigger**: Manuell über "Build with Parameters"
- **Parameter**:
  - RUN_CHROMIUM, RUN_FIREFOX, RUN_WEBKIT (Browser auswählen)
  - WORKERS (Anzahl paralleler Test-Worker)
- **Reports**: Allure Report, HTML Report, JUnit Results

### 2. Nightly Test Scheduler
- **Zweck**: Triggert automatisch den Hauptjob zu bestimmten Zeiten
- **Trigger**: Automatisch jeden Tag um 2:00 Uhr nachts (Cron)
- **Was passiert**: Startet "Playwright E2E Tests" mit allen Browsern und 4 Workers
- **Logs**: Kurzer Log, der nur zeigt, dass der Hauptjob getriggert wurde

**Wichtig**: Der Scheduler triggert nur - die eigentlichen Tests und Reports finden Sie im Hauptjob "Playwright E2E Tests".

### Scheduler-Job in Jenkins anlegen (Einmalig)

Falls der Scheduler-Job noch nicht existiert:

1. Öffnen Sie Jenkins: http://localhost:8080
2. Klicken Sie auf **"New Item"**
3. Name: **"Nightly Test Scheduler"**
4. Typ: **"Pipeline"**
5. Klicken Sie auf **"OK"**
6. Bei **"Pipeline"**:
   - Definition: **"Pipeline script from SCM"**
   - SCM: **"Git"**
   - Repository URL: `https://github.com/Albamaris/ecommerce-test-automation.git`
   - Credentials: Wählen Sie Ihre GitHub-Credentials
   - Branch: `*/main`
   - Script Path: **`Jenkinsfile.scheduler`**
7. Klicken Sie auf **"Save"**

Fertig! Der Scheduler läuft nun automatisch jeden Tag um 2:00 Uhr.

---

## Jenkins stoppen (vor dem Herunterfahren)

**Optional** - Docker stoppt die Container automatisch beim Herunterfahren, aber Sie können sie auch manuell stoppen:

```bash
cd C:\Projects\ecommerce-test-automation
docker compose down
```

---

## Nützliche Befehle

### Status prüfen
```bash
docker compose ps
```

### Jenkins-Logs ansehen
```bash
docker compose logs -f jenkins
```

### Container neu starten
```bash
docker restart jenkins-playwright
```

### Alles stoppen und neu starten
```bash
docker compose down
docker compose up -d
```

---

## Troubleshooting

### Problem: "Cannot connect to Docker daemon"
**Lösung:** Docker Desktop ist nicht gestartet. Starten Sie Docker Desktop.

### Problem: "Port 8080 already in use"
**Lösung:** Ein anderer Prozess verwendet Port 8080.
```bash
# Windows: Port freigeben
netstat -ano | findstr :8080
# Prozess beenden mit Task Manager
```

### Problem: Jenkins UI lädt nicht
**Lösung:**
1. Warten Sie weitere 30 Sekunden
2. Prüfen Sie Logs: `docker compose logs jenkins`
3. Container neu starten: `docker restart jenkins-playwright`

### Problem: "No such file or directory" bei docker compose
**Lösung:** Sie sind im falschen Verzeichnis.
```bash
cd C:\Projects\ecommerce-test-automation
```

---

## Zusammenfassung - Schnellstart

```bash
# 1. Terminal öffnen
cd C:\Projects\ecommerce-test-automation

# 2. Jenkins starten
docker compose up -d

# 3. Browser öffnen
# http://localhost:8080

# Fertig!
```
