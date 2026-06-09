# Jenkins CI/CD Setup Guide

Vollständige Anleitung zum Einrichten von Jenkins mit Docker für die Playwright E-Commerce Tests.

## Voraussetzungen

### Software

- **Docker Desktop**: [Download](https://docs.docker.com/get-docker/)
  - Windows: Docker Desktop für Windows
  - Mac: Docker Desktop für Mac
  - Linux: Docker Engine + Docker Compose

- **Git**: Für Repository-Integration

### System-Anforderungen

- Mindestens 4 GB RAM
- 10 GB freier Festplattenspeicher
- Port 8080 und 50000 müssen frei sein

## Installation

### Schritt 1: Jenkins starten

#### Windows

```cmd
jenkins-setup.bat
```

#### Linux/Mac

```bash
chmod +x jenkins-setup.sh
./jenkins-setup.sh
```

#### Alternative: Manuell mit npm

```bash
npm run jenkins:setup
```

### Schritt 2: Jenkins öffnen

1. Öffnen Sie `http://localhost:8080` im Browser
2. Warten Sie, bis die "Unlock Jenkins" Seite erscheint (ca. 30-60 Sekunden)

### Schritt 3: Jenkins entsperren

Das Initial Admin Password wird beim Start angezeigt. Falls nicht:

```bash
# Windows (PowerShell)
docker exec jenkins-playwright cat /var/jenkins_home/secrets/initialAdminPassword

# Linux/Mac
docker exec jenkins-playwright cat /var/jenkins_home/secrets/initialAdminPassword
```

Kopieren Sie das Passwort und fügen es in Jenkins ein.

### Schritt 4: Plugins installieren

1. Wählen Sie **"Install suggested plugins"**
2. Warten Sie, bis alle Plugins installiert sind (ca. 2-5 Minuten)

#### Zusätzliche empfohlene Plugins

Nach der Ersteinrichtung installieren Sie:

- **HTML Publisher** (für Playwright Reports)
- **JUnit** (für Test-Trends)
- **Docker Pipeline** (bereits vorinstalliert bei suggested plugins)

Gehen Sie zu: **Manage Jenkins** → **Manage Plugins** → **Available**

### Schritt 5: Admin-Benutzer erstellen

1. Geben Sie Ihre Daten ein:
   - Username: `admin` (oder beliebig)
   - Password: Ihr gewünschtes Passwort
   - Full Name: Ihr Name
   - Email: Ihre E-Mail

2. Klicken Sie auf **"Save and Continue"**

3. Bei "Instance Configuration" klicken Sie **"Save and Finish"**

## Pipeline einrichten

### Methode 1: Multibranch Pipeline (Empfohlen)

1. Klicken Sie auf **"New Item"**
2. Name: `E-Commerce Tests`
3. Typ: **Multibranch Pipeline**
4. Klicken Sie **"OK"**

#### Pipeline-Konfiguration

**Branch Sources:**
1. Klicken Sie **"Add source"** → **"Git"**
2. **Project Repository**: `https://github.com/Albamaris/ecommerce-test-automation.git`
3. **Credentials**: None (public repo) oder fügen Sie Credentials hinzu
4. **Behaviors**: Alle Branches mit Jenkinsfile

**Build Configuration:**
- **Mode**: by Jenkinsfile
- **Script Path**: `Jenkinsfile`

**Scan Multibranch Pipeline Triggers:**
- ☑️ Periodically if not otherwise run
- Interval: 1 minute (für Testing) oder 5 minutes (für Production)

**Speichern** und Jenkins wird automatisch das Repository scannen.

### Methode 2: Pipeline Job

1. **New Item** → **Pipeline**
2. Name: `E-Commerce Tests`
3. Unter **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/Albamaris/ecommerce-test-automation.git`
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`

## Ersten Build ausführen

### Automatischer Build

Jenkins startet automatisch einen Build nach dem Scan.

### Manueller Build

1. Gehen Sie zu Ihrer Pipeline
2. Klicken Sie **"Build Now"** (oder **"Scan Multibranch Pipeline Now"**)
3. Der Build wird in die Build Queue eingereiht

### Build beobachten

1. Klicken Sie auf die Build-Nummer (z.B. `#1`)
2. Klicken Sie **"Console Output"** um Live-Logs zu sehen
3. Warten Sie, bis der Build abgeschlossen ist (ca. 2-5 Minuten)

## Test Reports ansehen

### Nach erfolgreichem Build

1. Gehen Sie zur Build-Seite (z.B. `#1`)
2. Klicken Sie auf **"Playwright Test Report"** im Menü links
3. Sie sehen den interaktiven HTML Report mit:
   - Test-Ergebnisse pro Browser
   - Screenshots bei Fehlern
   - Videos bei Fehlern
   - Detaillierte Logs

### Test-Trends

1. Gehen Sie zur Pipeline-Hauptseite
2. Scrollen Sie nach unten
3. Sie sehen **"Test Result Trend"** Grafik
4. Zeigt Test-Ergebnisse über Zeit

## Nützliche Jenkins-Befehle

### Jenkins Logs ansehen

```bash
# Live-Logs
npm run jenkins:logs

# Oder direkt mit Docker
docker compose logs -f jenkins
```

### Jenkins stoppen

```bash
npm run jenkins:stop

# Oder direkt
docker compose down
```

### Jenkins neustarten

```bash
docker compose restart jenkins
```

### Jenkins-Daten löschen (kompletter Reset)

```bash
docker compose down -v
# WARNUNG: Löscht alle Jenkins-Konfigurationen und Build-Historie!
```

## GitHub Integration (Optional)

### Webhook für automatische Builds

1. Gehen Sie zu GitHub Repository Settings
2. **Webhooks** → **Add webhook**
3. **Payload URL**: `http://YOUR_JENKINS_URL:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Events**: "Just the push event"
6. **Active**: ☑️
7. **Add webhook**

**Hinweis**: Für lokales Jenkins benötigen Sie einen Tunnel-Service wie ngrok.

### Mit ngrok (für lokales Testing)

```bash
# ngrok installieren und starten
ngrok http 8080

# Verwenden Sie die ngrok URL in GitHub Webhook
https://YOUR-NGROK-URL.ngrok.io/github-webhook/
```

## Troubleshooting

### Problem: Port 8080 bereits belegt

**Lösung**: Port in `docker-compose.yml` ändern

```yaml
ports:
  - "9090:8080"  # Statt 8080:8080
```

Dann Jenkins auf `http://localhost:9090` öffnen.

### Problem: Jenkins startet nicht

**Diagnose**:

```bash
docker compose logs jenkins
```

**Häufige Ursachen**:
- Docker ist nicht gestartet
- Nicht genügend RAM
- Festplatte voll

### Problem: Tests schlagen in Jenkins fehl, lokal aber nicht

**Mögliche Ursachen**:
- Playwright-Browser-Versionen unterschiedlich
- Netzwerk-Timeouts in Docker

**Lösung**: Timeout in `playwright.config.ts` erhöhen

```typescript
timeout: 60 * 1000, // 60 Sekunden
```

### Problem: HTML Report wird nicht angezeigt

**Prüfen Sie**:
1. HTML Publisher Plugin installiert?
2. Build erfolgreich abgeschlossen?
3. Console Output auf Fehler prüfen

**Lösung**:
```bash
# In Jenkins Container
docker exec jenkins-playwright ls /var/jenkins_home/workspace/*/playwright-report/
```

### Problem: "Permission denied" Fehler

**Lösung**: User in `docker-compose.yml` auf `root` setzen (bereits konfiguriert)

## Best Practices

### 1. Regelmäßige Backups

```bash
# Jenkins Home Backup
docker exec jenkins-playwright tar -czf /tmp/jenkins-backup.tar.gz /var/jenkins_home
docker cp jenkins-playwright:/tmp/jenkins-backup.tar.gz ./jenkins-backup.tar.gz
```

### 2. Resource Limits setzen

In `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
```

### 3. Build-Historie begrenzen

In Pipeline-Konfiguration:
- Discard old builds
- Max # of builds to keep: 10

### 4. Parallele Builds limitieren

**Manage Jenkins** → **Configure System** → **# of executors**: 2

## Weitere Ressourcen

- [Jenkins Dokumentation](https://www.jenkins.io/doc/)
- [Docker Dokumentation](https://docs.docker.com/)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)

## Support

Bei Problemen:
1. Console Output in Jenkins prüfen
2. Docker Logs ansehen: `docker compose logs jenkins`
3. GitHub Issues: [Repository Issues](https://github.com/Albamaris/ecommerce-test-automation/issues)

---

**Letzte Aktualisierung**: Dezember 2024
**Version**: 1.0
