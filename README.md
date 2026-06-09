# E-Commerce Test Automation

Automatisierte End-to-End Tests für den E-Commerce Demo-Shop mit Playwright, TypeScript und Jenkins CI/CD.

## Aufgabenstellung

Automatisierung eines vollständigen Einkaufsprozesses:

1. ✅ Demo Shop öffnen (über `BASE_URL` konfiguriert)
2. ✅ Überschrift "Shop" verifizieren
3. ✅ Warenkorb-Status prüfen (leer)
4. ✅ Artikel "Album" zum Warenkorb hinzufügen
5. ✅ Zum Warenkorb navigieren
6. ✅ Anzahl auf 2 erhöhen
7. ✅ Warenkorb aktualisieren
8. ✅ Gesamtpreis verifizieren (30,00 €)

## Technologie-Stack

- **Framework**: Playwright
- **Sprache**: TypeScript
- **Pattern**: Page Object Model (POM)
- **Reporting**: Playwright HTML Reports, JUnit XML
- **CI/CD**: Jenkins mit Docker

## Projektstruktur

```
.
├── pages/                  # Page Object Models
│   ├── ShopPage.ts        # Shop-Hauptseite
│   └── CartPage.ts        # Warenkorb-Seite
├── tests/                 # Test Specs
│   └── ecommerce.spec.ts  # E-Commerce Workflow Tests
├── playwright.config.ts   # Playwright Konfiguration
├── tsconfig.json         # TypeScript Konfiguration
├── package.json          # Projekt Dependencies
├── TROUBLESHOOTING.md     # Herausforderungen & Lösungen (Lessons Learned)
└── README.md             # Diese Datei
```

> Eine Dokumentation der wichtigsten Herausforderungen während der Umsetzung
> (Race Conditions, AJAX-Timing, robuste Assertions) findet sich in
> [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Installation

### Voraussetzungen

- Node.js (v16 oder höher)
- npm oder yarn

### Setup

```bash
# Repository klonen
git clone https://github.com/Albamaris/ecommerce-test-automation.git
cd ecommerce-test-automation

# Dependencies installieren
npm install

# Playwright Browser installieren
npx playwright install
```

## Konfiguration

Die zu testende Shop-URL (System under Test) ist nicht im Code hinterlegt, sondern
wird über die Umgebungsvariable `BASE_URL` gesetzt.

**Lokal:** `.env.example` nach `.env` kopieren und die URL eintragen:

```bash
cp .env.example .env
# anschließend BASE_URL in .env auf die Ziel-URL setzen
```

**CI (GitHub Actions):** `BASE_URL` als Repository-Variable hinterlegen
(Settings → Secrets and variables → Actions → Variables → New repository variable).
Die Pipeline liest den Wert automatisch aus `vars.BASE_URL`.

## Tests ausführen

### Alle Tests ausführen

```bash
# Headless Mode (Standard)
npm test

# Mit sichtbarem Browser
npm run test:headed

# Im UI Mode (interaktiv)
npm run test:ui

# Debug Mode
npm run test:debug
```

### Spezifische Tests

```bash
# Nur Chromium
npx playwright test --project=chromium

# Nur einen bestimmten Test
npx playwright test ecommerce.spec.ts

# Mit grep Filter
npx playwright test -g "Complete purchase workflow"
```

## Test Reports

### Playwright HTML Report

```bash
# HTML Report anzeigen
npm run test:report

# Report wird automatisch nach Testlauf generiert in:
# ./playwright-report/index.html
```

### JUnit XML Report (für CI/CD)

JUnit XML Reports werden automatisch generiert für Jenkins-Integration:

```bash
# Nach Testlauf verfügbar in:
# ./test-results/junit.xml
```

Diese Reports ermöglichen:

- Test-Trends in Jenkins
- Fehler-Tracking über Zeit
- Build-Status basierend auf Test-Ergebnissen

## Architektur

### Page Object Pattern

Die Tests verwenden das Page Object Model für bessere Wartbarkeit:

**ShopPage.ts**

- Kapselt alle Interaktionen auf der Shop-Hauptseite
- Methoden: `goto()`, `verifyShopHeading()`, `addAlbumToCart()`, etc.

**CartPage.ts**

- Kapselt alle Interaktionen auf der Warenkorb-Seite
- Methoden: `updateQuantity()`, `verifyTotalPrice()`, etc.

### Test-Struktur

```typescript
test.describe("E-Commerce Shopping Workflow", () => {
  test("Complete purchase workflow", async ({ page }) => {
    // Arrange
    const shopPage = new ShopPage(page);
    const cartPage = new CartPage(page);

    // Act & Assert mit test.step() für bessere Reports
    await test.step("Navigate to demo shop", async () => {
      await shopPage.goto();
    });
    // ... weitere Steps
  });
});
```

## Konfiguration

### Playwright Config Highlights

- **Parallel Execution**: Tests laufen parallel
- **Retries**: 2 Retries auf CI
- **Reporters**: HTML, JSON, JUnit, List
- **Screenshots**: Bei Fehlern
- **Videos**: Bei Fehlern
- **Traces**: Bei Retry

### Browser-Unterstützung

- ✅ Chromium
- ✅ Firefox
- ✅ WebKit (Safari)

## Jenkins CI/CD Integration

Vollständige Jenkins-Testumgebung mit Docker für automatisierte Testausführung.

### Schnellstart

#### 1. Jenkins starten

**Windows:**

```cmd
jenkins-setup.bat
```

**Linux/Mac:**

```bash
chmod +x jenkins-setup.sh
./jenkins-setup.sh
```

**Oder mit npm:**

```bash
npm run jenkins:setup
```

#### 2. Jenkins öffnen

Öffnen Sie `http://localhost:8080` im Browser und folgen Sie den Setup-Anweisungen.

#### 3. Pipeline konfigurieren

1. **New Item** → **Multibranch Pipeline**
2. **Branch Source**: Git → Repository URL eingeben
3. **Build Configuration**: Jenkinsfile
4. **Save** und Jenkins scannt automatisch das Repository

### Jenkins-Befehle

```bash
# Jenkins starten
npm run jenkins:setup

# Jenkins stoppen
npm run jenkins:stop

# Jenkins Logs ansehen
npm run jenkins:logs
```

### Features

- ✅ **Docker-basiert**: Einfaches Setup ohne lokale Installation
- ✅ **Multi-Browser Tests**: Parallel auf Chromium, Firefox, WebKit
- ✅ **HTML Reports**: Interaktive Playwright Reports in Jenkins
- ✅ **JUnit Integration**: Test-Trends und Statistiken
- ✅ **Artifact Archiving**: Screenshots und Videos bei Fehlern
- ✅ **Automatische Builds**: Auf Code-Änderungen (optional via Webhook)

### Detaillierte Anleitung

Für vollständige Setup-Anleitung siehe: **[docs/JENKINS_SETUP.md](docs/JENKINS_SETUP.md)**

Enthält:

- Voraussetzungen und System-Anforderungen
- Schritt-für-Schritt Installation
- Plugin-Konfiguration
- Pipeline-Setup (2 Methoden)
- GitHub Webhook Integration
- Troubleshooting Guide
- Best Practices

## Best Practices

### Implementiert

1. **Page Object Pattern**: Trennung von Test-Logik und UI-Interaktionen
2. **Explizite Waits**: `waitForLoadState()`, `expect().toBeVisible()`
3. **Aussagekräftige Assertions**: Klare Fehlermeldungen
4. **Test Steps**: Strukturierte Test-Schritte für bessere Reports
5. **Type Safety**: TypeScript für Compile-Time Checks
6. **Reusable Locators**: Zentrale Definition in Page Objects
7. **Error Handling**: Timeouts und Retry-Mechanismen

### Robustheit

- Auto-waiting: Playwright wartet automatisch auf Elemente
- Network idle: Warten auf vollständiges Laden
- Flexible Locators: CSS, Text, Filter kombiniert
- Screenshot/Video bei Fehlern für Debugging

## Troubleshooting

### Tests schlagen fehl mit Timeout

```bash
# Timeout erhöhen
npx playwright test --timeout=60000
```

### Element nicht gefunden

```bash
# Im Debug Mode laufen lassen
npm run test:debug

# Oder Codegen verwenden um Locators zu finden
npm run test:codegen
```

### Browser startet nicht

```bash
# Browser neu installieren
npx playwright install --force
```

## Weitere Ressourcen

- [Playwright Dokumentation](https://playwright.dev)
- [Jenkins Dokumentation](https://www.jenkins.io/doc/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators Guide](https://playwright.dev/docs/locators)
- [Docker Dokumentation](https://docs.docker.com/)

## Autor

Ozren Jovic - Test Automation Engineer

## Lizenz

MIT

## Features

- ✅ Vollständige E2E-Test-Abdeckung aller 8 Geschäftsschritte
- ✅ Multi-Browser-Support (Chromium, Firefox, WebKit)
- ✅ Page Object Model für Wartbarkeit
- ✅ Playwright HTML Reports mit interaktiven Visualisierungen
- ✅ Jenkins CI/CD mit Docker (vollständig konfiguriert)
- ✅ TypeScript für Type-Safety
- ✅ Screenshot & Video bei Fehlern
- ✅ Automatische Retries auf CI
- ✅ JUnit XML Reports für Test-Trends

Test auto-trigger
