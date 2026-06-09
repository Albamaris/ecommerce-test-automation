# Troubleshooting & Lessons Learned

Dokumentation der wichtigsten Herausforderungen bei der Implementierung der
Testautomatisierung – jeweils mit Problem, Analyse und der gewählten Lösung.
Schwerpunkt: der Umgang mit asynchronen UI-Updates (WooCommerce/AJAX) und der
Übergang von festen Wartezeiten zu robusten, auf Zustände wartenden Assertions.

## Endergebnis

- 9 von 9 Tests bestanden
- Alle 3 Browser (Chromium, Firefox, WebKit) erfolgreich
- Alle 8 Schritte des Einkaufs-Workflows implementiert und getestet

---

## Problem 1 – Warenkorb-Leer-Prüfung schlug fehl

**Symptom:** Die Prüfung auf den leeren Warenkorb scheiterte in allen Browsern.

```ts
// erwartet
await expect(this.cartCount).toHaveText('0');
```

**Analyse:** Der Test erwartete `"0"`, das DOM enthielt aber `"0 items"`.
Der Selektor `.cart-contents .count` greift ein `<span class="count">`, das den
vollständigen Text inklusive Einheit enthält.

**Lösung:** Assertion an den tatsächlichen DOM-Inhalt angepasst.

```ts
await expect(this.cartCount).toHaveText('0 items');
```

---

## Problem 2 – Preisaktualisierung lief der Verifikation davon

**Symptom:** Nach dem Klick auf *Update cart* war der Preis im DOM noch nicht
aktualisiert, während die Verifikation bereits lief (Race Condition).

**Ablauf:**

1. Menge auf 2 ändern
2. *Update cart* klicken
3. Button wird während des AJAX-Requests kurz deaktiviert
4. Button wird wieder aktiviert
5. **Erst danach** aktualisiert WooCommerce den Preis im DOM

WooCommerce stößt eine AJAX-Anfrage an, die den Warenkorb serverseitig
aktualisiert, eine Antwort liefert und anschließend das DOM neu rendert.
Zwischen „Button wieder aktiv" und „DOM aktualisiert" liegt eine kurze
Verzögerung.

**Erste Lösung** (funktioniert, aber mit fester Pufferzeit):

```ts
async clickUpdateCart() {
  await this.updateCartButton.click();
  await expect(this.updateCartButton).not.toBeDisabled({ timeout: 10000 });
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000); // fester Puffer – nicht ideal
}
```

In der finalen Implementierung wird stattdessen gezielt auf den
AJAX-Response gewartet (siehe `pages/CartPage.ts`), wodurch der feste Puffer
entfällt.

---

## Problem 3 – Robuste statt fester Preis-Verifikation

**Ursprünglicher Code:**

```ts
async verifyTotalPrice(expectedPrice: string) {
  await this.page.waitForTimeout(1000); // feste Wartezeit
  const totalText = await this.cartTotal.textContent();
  expect(totalText?.trim()).toContain(expectedPrice);
}
```

**Probleme mit festen Wartezeiten:**

- Nicht zuverlässig – das Timing schwankt je nach System.
- Auf schnellen Systemen wird Zeit verschwendet.
- Auf langsamen Systemen reicht die Zeit nicht.

**Bessere Lösung** – auf den tatsächlichen Zustand warten:

```ts
async verifyTotalPrice(expectedPrice: string) {
  // wartet aktiv bis der Preis erscheint, maximal 10 Sekunden
  await expect(this.cartTotal).toContainText(expectedPrice, { timeout: 10000 });
}
```

**Warum besser:** Playwright wartet aktiv, bis der erwartete Text erscheint, und
fährt sofort fort, sobald er da ist. Die maximale Wartezeit dient nur als
Sicherheitsnetz; typischerweise dauert die AJAX-Anfrage nur 1–3 Sekunden.

---

## Debugging-Vorgehen

1. **Testergebnisse analysieren** (`results.json`): Alle drei Browser scheiterten
   am selben Schritt – `Expected "0", Received "0 items"`.
2. **Error-Context prüfen:** Der Page-Snapshot zeigte die reale DOM-Struktur
   `<span class="count">0 items</span>`.
3. **Erneut testen:** Nach dem ersten Fix trat ein neuer Fehler auf – Preis
   `15,00 €` statt `30,00 €`; die Menge war auf 2 gesetzt, der Preis aber nicht
   aktualisiert.
4. **Timing-Problem identifiziert:** Der Button war bereits wieder aktiv, der
   Preis aber noch nicht aktualisiert – Race Condition.
5. **Robuste Lösung umgesetzt:** Feste Wartezeiten durch zustandsbasiertes
   Warten ersetzt (`toContainText()` mit Timeout, Warten auf den AJAX-Response).

**Kernlektion:** In dynamischen, AJAX-getriebenen Oberflächen sind feste
Wartezeiten eine Fehlerquelle. Zuverlässig wird es erst, wenn Tests auf
konkrete Zustände warten statt auf die Uhr.
