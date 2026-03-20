/**
 * Returns the current Date object in a given IANA timezone.
 */
function nowIn(timezone) {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * US Markets: NYSE / NASDAQ
 * Monday–Friday, 9:30 AM – 4:00 PM ET
 * (America/New_York handles DST automatically)
 */
export function isUSMarketOpen() {
  const et  = nowIn('America/New_York');
  const day = et.getDay();
  if (day === 0 || day === 6) return false;
  const t = et.getHours() * 60 + et.getMinutes();
  return t >= 9 * 60 + 30 && t < 16 * 60;
}

/**
 * Indonesia Stock Exchange (IDX)
 * Monday–Friday
 *   Session 1 : 09:00 – 12:00 WIB
 *   Session 2 : 13:30 – 15:49 WIB
 */
export function isIDXMarketOpen() {
  const wib = nowIn('Asia/Jakarta');
  const day = wib.getDay();
  if (day === 0 || day === 6) return false;
  const t = wib.getHours() * 60 + wib.getMinutes();
  return (t >= 9 * 60 && t < 12 * 60) || (t >= 13 * 60 + 30 && t < 15 * 60 + 49);
}

/**
 * Returns a label describing the next opening time (best-effort).
 */
export function getMarketStatus() {
  return {
    us:  { open: isUSMarketOpen(),  label: 'NYSE / NASDAQ', flag: '🇺🇸' },
    idx: { open: isIDXMarketOpen(), label: 'IDX',           flag: '🇮🇩' },
  };
}
