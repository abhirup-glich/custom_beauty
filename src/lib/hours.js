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

export function parseTimeMinutes(text) {
  if (!text || typeof text !== 'string') return 0;
  const m = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function parseDayRange(val) {
  if (!val || typeof val !== 'string' || /^closed$/i.test(val.trim())) return [];
  return val.split(',').map((range) => {
    const parts = range.split('-');
    if (parts.length !== 2) return [];
    const start = parseTimeMinutes(parts[0]);
    const end = parseTimeMinutes(parts[1]);
    return end > start ? [start, end] : [];
  }).filter((r) => r.length === 2);
}

/**
 * Converts a friendly hours object:
 * { sunday: "10:00-18:00", monday: "closed", tuesday: "10:00-20:00", ... }
 * into an array of ranges indexed by day (0 = Sunday ... 6 = Saturday).
 */
export function parseHoursObject(hoursObj) {
  if (!hoursObj || typeof hoursObj !== 'object') return null;
  // If already an array of 7 elements, return as is
  if (Array.isArray(hoursObj) && hoursObj.length === 7) return hoursObj;

  const lowerMap = {};
  for (const [k, v] of Object.entries(hoursObj)) {
    lowerMap[k.toLowerCase()] = v;
  }

  return DAY_KEYS.map((day) => parseDayRange(lowerMap[day]));
}

/**
 * Checks if the salon is currently open based on hours array and timezone.
 */
export function getIsOpenNow(hours, timezone = 'Asia/Kolkata') {
  if (!hours) return null;
  const rangesByDay = Array.isArray(hours) ? hours : parseHoursObject(hours);
  if (!rangesByDay) return null;

  const now = new Date();
  let day = now.getDay();
  let minutes = now.getHours() * 60 + now.getMinutes();

  if (timezone) {
    try {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
          .formatToParts(now)
          .map((p) => [p.type, p.value]),
      );
      day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
      minutes = Number(parts.hour) * 60 + Number(parts.minute);
    } catch {
      // fallback to local time
    }
  }

  const dayRanges = rangesByDay[day] || [];
  return dayRanges.some(([start, end]) => minutes >= start && minutes < end);
}
