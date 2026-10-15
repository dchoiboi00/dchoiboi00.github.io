// Project dates are 'YYYY-MM-DD' strings so the data file stays readable.
// Parsing in UTC keeps the day count the same in every time zone.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 24 * 60 * 60 * 1000;

const parse = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, time: Date.UTC(year, month - 1, day) };
};

const checkOrder = (start: string, end: string) => {
  if (parse(end).time < parse(start).time) {
    throw new Error(`Project ends before it starts: ${start} to ${end}`);
  }
};

/** "Oct 2025 – Feb 2026", "Apr – Jun 2026", or "Sep 2026". */
export function formatPeriod(start: string, end: string): string {
  checkOrder(start, end);
  const from = parse(start);
  const to = parse(end);
  const fromMonth = MONTHS[from.month - 1];
  const toMonth = MONTHS[to.month - 1];
  if (from.year !== to.year) return `${fromMonth} ${from.year} – ${toMonth} ${to.year}`;
  if (from.month !== to.month) return `${fromMonth} – ${toMonth} ${to.year}`;
  return `${toMonth} ${to.year}`;
}

/** Weeks for projects under six weeks ("3 weeks"), months otherwise ("4 months"). */
export function formatLength(start: string, end: string): string {
  checkOrder(start, end);
  const days = (parse(end).time - parse(start).time) / DAY_MS;
  if (days < 42) {
    const weeks = Math.max(1, Math.round(days / 7));
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  const months = Math.round(days / 30.44);
  return months === 1 ? '1 month' : `${months} months`;
}
