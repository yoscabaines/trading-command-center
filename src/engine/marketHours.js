// Market-hours engine. A cron firing does NOT mean the market is open —
// every caller that gates behavior on market state should go through here.
//
// U.S. equity market hours (Eastern Time):
//   Premarket:    04:00–09:30
//   Regular:      09:30–16:00
//   After-hours:  16:00–20:00
//   Closed otherwise, all weekends, and on NYSE holidays.
//
// 2026 NYSE holiday + early-close calendar (verify yearly — this list does
// not update itself; the NYSE publishes the following year's calendar each
// fall at https://www.nyse.com/markets/hours-calendars).
const HOLIDAYS_2026 = [
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25',
  '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25',
];
const EARLY_CLOSES_2026 = { // date -> close time (ET, 24h)
  '2026-07-02': '13:00', // day before July 4th observance nuance varies; verify each year
  '2026-11-27': '13:00', // day after Thanksgiving
  '2026-12-24': '13:00',
};

function etParts(date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    hhmm: `${parts.hour}:${parts.minute}`,
    weekday: parts.weekday, // 'Mon'..'Sun'
  };
}

export function getMarketStatus(now = new Date()) {
  const { dateStr, hhmm, weekday } = etParts(now);

  if (weekday === 'Sat' || weekday === 'Sun') {
    return { status: 'closed', reason: 'weekend', dateStr };
  }
  if (HOLIDAYS_2026.includes(dateStr)) {
    return { status: 'closed', reason: 'holiday', dateStr };
  }

  const closeTime = EARLY_CLOSES_2026[dateStr] || '16:00';
  if (hhmm < '04:00') return { status: 'closed', reason: 'overnight', dateStr };
  if (hhmm < '09:30') return { status: 'premarket', dateStr };
  if (hhmm < closeTime) return { status: 'regular', dateStr, earlyClose: !!EARLY_CLOSES_2026[dateStr] };
  if (hhmm < '20:00') return { status: 'after-hours', dateStr };
  return { status: 'closed', reason: 'overnight', dateStr };
}

export function isRegularSession(now = new Date()) {
  return getMarketStatus(now).status === 'regular';
}
