/**
 * Product Test Data
 * Central source of truth for all product-related test data
 */

export interface Product {
  name: string;
  price: number;
  currency: string;
}

export const PRODUCTS = {
  ALBUM: {
    name: 'Album',
    price: 15.00,
    currency: '€'
  },
  BEANIE: {
    name: 'Beanie',
    price: 18.00,
    currency: '€'
  },
  // Weitere Produkte hier...
} as const;

/**
 * Helper function to format price for German locale
 */
export function formatPrice(amount: number, currency: string = '€'): string {
  return `${amount.toFixed(2).replace('.', ',')} ${currency}`;
}

/**
 * Calculate total price based on quantity
 */
export function calculateTotal(product: Product, quantity: number): string {
  const total = product.price * quantity;
  return formatPrice(total, product.currency);
}
