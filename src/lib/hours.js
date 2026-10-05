// Shared by the browser bundle and the Node build scripts — keep it dependency-free.
// Opening hours are an array indexed by weekday (0 = Sunday, matching Date#getDay),
// each entry a list of [startMinute, endMinute] ranges. An empty list means closed.

export const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function formatTime(minutes) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

export function formatRanges(ranges) {
  if (!ranges.length) return 'Closed';
  return ranges.map(([s, e]) => `${formatTime(s)} – ${formatTime(e)}`).join(', ');
}

// Collapses consecutive days with identical hours: "Tuesday – Saturday: 10:00 AM – 8:00 PM".
export function groupHours(hours) {
  const groups = [];
  for (const day of DISPLAY_ORDER) {
    const time = formatRanges(hours[day]);
    const last = groups[groups.length - 1];
    if (last && last.time === time) last.to = day;
    else groups.push({ from: day, to: day, time });
  }
  return groups.map(({ from, to, time }) => ({
    days: from === to ? DAY_LABELS[from] : `${DAY_LABELS[from]} – ${DAY_LABELS[to]}`,
    time,
  }));
}
