export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "NZD", "CHF", "SGD", "ZAR"] as const;

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

/** Parses "12", "12.5", "1,200.00" into integer cents. Returns null if invalid. */
export function parseToCents(input: string): number | null {
  const s = input.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const cents = Math.round(parseFloat(s) * 100);
  return cents > 0 && cents <= 1_000_000_000 ? cents : null;
}
