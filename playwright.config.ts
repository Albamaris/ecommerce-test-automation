import { defineConfig, devices, ReporterDescription  } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Playwright Test Configuration
 * See https://playwright.dev/docs/test-configuration
 */

// Minimaler .env-Loader (ohne externe Abhängigkeit).
// Lädt BASE_URL & Co. aus einer optionalen .env-Datei im Projektwurzelverzeichnis.
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

// Ziel-System (System under Test) wird ausschließlich über die Umgebung gesetzt –
// keine fest verdrahtete URL im Repository.
const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error(
    'BASE_URL ist nicht gesetzt. Lege eine .env-Datei an (Vorlage: .env.example) ' +
    'oder setze die Umgebungsvariable BASE_URL auf die zu testende Shop-URL.'
  );
}

// Build reporter array - Allure is optional based on GENERATE_ALLURE env variable
const reporters: ReporterDescription[] = [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],
  ['list']
];

// Add Allure reporter only if GENERATE_ALLURE=true
if (process.env.GENERATE_ALLURE === 'true') {
  reporters.push(['allure-playwright', { outputFolder: 'allure-results' }]);
}

export default defineConfig({
  testDir: './tests',

  /* Maximum time one test can run for */
  timeout: 30 * 1000,

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: reporters,
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: baseURL,
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on first retry */
    video: 'retain-on-failure',
    
    /* Browser context options */
    viewport: { width: 1280, height: 720 },
    
    /* Maximum time for actions like click, fill, etc */
    actionTimeout: 10 * 1000,
    
    /* Maximum time for navigation */
    navigationTimeout: 30 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
