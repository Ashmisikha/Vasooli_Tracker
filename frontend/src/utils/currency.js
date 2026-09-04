/**
 * Currency & Market formatting utility for Vasooli Wealth.
 * Formats Indian stocks/indices with Rupee symbol (₹) and US stocks/indices with Dollar symbol ($).
 */

const INDIAN_INDICES = new Set([
  'NIFTY 50', 'NIFTY50', 'SENSEX', 'BANK NIFTY', 'BANKNIFTY', 
  'NIFTY IT', 'NIFTYIT', 'BSE SENSEX', 'NIFTY AUTO', 'NIFTY PHARMA', 'NIFTY'
]);

/**
 * Determines if a stock symbol, stock object, or market identifier represents an Indian asset.
 */
export const isIndianStock = (stockOrSymbol, selectedMarket = null) => {
  if (selectedMarket) {
    const sm = String(selectedMarket).toLowerCase();
    if (sm === 'india' || sm === 'in') return true;
    if (sm === 'us' || sm === 'usa') return false;
  }

  if (!stockOrSymbol) return false;

  if (typeof stockOrSymbol === 'string') {
    const sym = stockOrSymbol.toUpperCase().trim();
    if (INDIAN_INDICES.has(sym)) return true;
    if (sym.endsWith('.NS') || sym.endsWith('.BO') || sym.endsWith('.BSE') || sym.endsWith('.NSE')) return true;
    return false;
  }

  const sym = (stockOrSymbol.symbol || stockOrSymbol.ticker || stockOrSymbol.name || '').toUpperCase().trim();
  if (INDIAN_INDICES.has(sym)) return true;
  if (sym.endsWith('.NS') || sym.endsWith('.BO') || sym.endsWith('.BSE') || sym.endsWith('.NSE')) return true;

  const country = (stockOrSymbol.country || stockOrSymbol.analysis?.country || '').toLowerCase();
  if (country === 'india' || country === 'in') return true;

  const market = (stockOrSymbol.market || stockOrSymbol.analysis?.market || '').toLowerCase();
  if (market === 'in' || market === 'india') return true;

  const currency = (stockOrSymbol.currency || stockOrSymbol.analysis?.currency || '').toUpperCase();
  if (currency === 'INR') return true;

  return false;
};

/**
 * Returns '₹' for Indian stocks / indices / markets, and '$' for USA.
 */
export const getCurrencySymbol = (stockOrSymbol, selectedMarket = null) => {
  return isIndianStock(stockOrSymbol, selectedMarket) ? '₹' : '$';
};

/**
 * Formats a numerical price with the appropriate currency symbol.
 */
export const formatPrice = (price, stockOrSymbol, selectedMarket = null, decimals = 2) => {
  if (price === null || price === undefined || isNaN(price)) return '---';
  const sym = getCurrencySymbol(stockOrSymbol, selectedMarket);
  const num = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(num)) return '---';
  return `${sym}${num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

/**
 * Formats a delta/change price with sign and currency symbol, e.g. +₹12.50 or -$3.20.
 */
export const formatDeltaPrice = (delta, stockOrSymbol, selectedMarket = null, decimals = 2) => {
  if (delta === null || delta === undefined || isNaN(delta)) return '---';
  const sym = getCurrencySymbol(stockOrSymbol, selectedMarket);
  const num = typeof delta === 'number' ? delta : parseFloat(delta);
  if (isNaN(num)) return '---';
  const isPositive = num >= 0;
  return `${isPositive ? '+' : '-'}${sym}${Math.abs(num).toFixed(decimals)}`;
};
