// All salon content comes from salon.json, resolved at build time by scripts/salon-data.mjs.
import salon from 'virtual:salon';
import { formatTime } from './lib/hours.js';

export default salon;

const priceFormat = new Intl.NumberFormat(salon.locale, {
  style: 'currency',
  currency: salon.currency,
  maximumFractionDigits: 0,
});

export const formatPrice = (amount) => priceFormat.format(amount);

export const whatsappLink = (message) =>
  `https://wa.me/${salon.whatsapp}?text=${encodeURIComponent(message)}`;

// Current weekday + minute-of-day in the salon's own time zone (visitors may be elsewhere).
function salonNow() {
  const now = new Date();
  if (!salon.timezone) return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() };
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: salon.timezone, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** true / false, or null when opening hours are unknown. */
export function isOpenNow() {
  if (!salon.hours) return null;
  const { day, minutes } = salonNow();
  return salon.hours[day].some(([start, end]) => minutes >= start && minutes < end);
}

export function isClosedOn(date) {
  return Boolean(salon.hours) && salon.hours[date.getDay()].length === 0;
}

const FALLBACK_RANGES = [[10 * 60, 20 * 60]];

export function timeSlotsFor(date) {
  const ranges = salon.hours ? salon.hours[date.getDay()] : FALLBACK_RANGES;
  const step = salon.booking.slotMinutes;
  const slots = [];
  for (const [start, end] of ranges) {
    for (let t = start; t + step <= end; t += step) slots.push(formatTime(t));
  }
  return slots;
}

// Sections only appear when salon.json has content for them.
export const sections = {
  about: true,
  transformations: salon.transformations.items.length > 0,
  packages: salon.packages.length > 0,
  bridal: Boolean(salon.bridal),
  team: salon.team.length > 0,
  gallery: salon.gallery.length > 0,
  testimonials: salon.testimonials.length > 0,
};
