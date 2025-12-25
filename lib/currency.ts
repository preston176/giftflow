/**
 * Multi-Currency Support System
 * Auto-detects user's location and sets appropriate currency
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "en-EU" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", locale: "en-KE" },
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", locale: "en-NG" },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN" },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", locale: "pt-BR" },
  MXN: { code: "MXN", symbol: "Mex$", name: "Mexican Peso", locale: "es-MX" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE" },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", locale: "ar-SA" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
  HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", locale: "en-HK" },
  CHF: { code: "CHF", symbol: "Fr", name: "Swiss Franc", locale: "de-CH" },
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona", locale: "sv-SE" },
  NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone", locale: "nb-NO" },
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  KE: "KES",
  NG: "NGN",
  ZA: "ZAR",
  IN: "INR",
  CA: "CAD",
  AU: "AUD",
  JP: "JPY",
  CN: "CNY",
  BR: "BRL",
  MX: "MXN",
  AE: "AED",
  SA: "SAR",
  SG: "SGD",
  HK: "HKD",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  // EU countries
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  IE: "EUR",
  FI: "EUR",
  GR: "EUR",
};

/**
 * Detect user's currency based on location
 */
export async function detectCurrency(): Promise<string> {
  // First check localStorage
  const stored = localStorage.getItem("preferred-currency");
  if (stored && CURRENCIES[stored]) {
    return stored;
  }

  // Try to get from browser locale
  const browserLocale = navigator.language || "en-US";
  const countryCode = browserLocale.split("-")[1]?.toUpperCase();

  if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
    return COUNTRY_CURRENCY_MAP[countryCode];
  }

  // Try geolocation API (if available)
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (response.ok) {
      const data = await response.json();
      const detectedCountry = data.country_code;

      if (detectedCountry && COUNTRY_CURRENCY_MAP[detectedCountry]) {
        return COUNTRY_CURRENCY_MAP[detectedCountry];
      }
    }
  } catch (error) {
    console.log("Could not detect location for currency:", error);
  }

  // Default to USD
  return "USD";
}

/**
 * Format currency value with proper locale
 */
export function formatCurrency(
  amount: number | string,
  currencyCode: string = "USD"
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return `${currency.symbol}0.00`;
  }

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch (error) {
    // Fallback formatting
    return `${currency.symbol}${numAmount.toFixed(2)}`;
  }
}

/**
 * Get currency object by code
 */
export function getCurrency(code: string): Currency {
  return CURRENCIES[code] || CURRENCIES.USD;
}

/**
 * Save currency preference
 */
export function saveCurrencyPreference(currencyCode: string): void {
  if (CURRENCIES[currencyCode]) {
    localStorage.setItem("preferred-currency", currencyCode);
  }
}

/**
 * Get all available currencies as array
 */
export function getAllCurrencies(): Currency[] {
  return Object.values(CURRENCIES).sort((a, b) => a.name.localeCompare(b.name));
}
