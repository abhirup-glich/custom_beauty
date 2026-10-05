/**
 * Google Calendar Integration Utilities
 * Generates direct Google Calendar event creation links and embed views.
 */

/**
 * Format a Date object and time string into Google Calendar UTC/Local ISO format (YYYYMMDDTHHmmss)
 */
function toGCalDateTimeString(dateStr, timeStr) {
  try {
    let year, month, day;
    if (dateStr instanceof Date) {
      year = dateStr.getFullYear();
      month = dateStr.getMonth();
      day = dateStr.getDate();
    } else if (typeof dateStr === 'string') {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        const d = new Date(dateStr);
        year = d.getFullYear();
        month = d.getMonth();
        day = d.getDate();
      }
    } else {
      const d = new Date();
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
    }

    let hours = 10;
    let minutes = 0;
    if (typeof timeStr === 'string') {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
      }
    }

    const start = new Date(year, month, day, hours, minutes, 0);
    return start;
  } catch (e) {
    console.error('Error parsing date/time for Google Calendar:', e);
    return new Date();
  }
}

/**
 * Format Date to YYYYMMDDTHHmm00
 */
function formatGCalStamp(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

/**
 * Create a direct 1-click Google Calendar Event URL
 */
export function createGoogleCalendarUrl({
  title = 'Salon Appointment',
  description = '',
  location = '',
  startDate,
  startTime = '10:00',
  durationMinutes = 60,
}) {
  try {
    const startDt = toGCalDateTimeString(startDate, startTime);
    const endDt = new Date(startDt.getTime() + (Number(durationMinutes) || 60) * 60 * 1000);

    const datesParam = `${formatGCalStamp(startDt)}/${formatGCalStamp(endDt)}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: datesParam,
      details: description,
      location: location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (err) {
    console.error('Error generating Google Calendar URL:', err);
    return 'https://calendar.google.com';
  }
}

/**
 * Get Google Calendar Embed URL for displaying calendar inside Admin
 */
export function getGoogleCalendarEmbedUrl(calendarId, mode = 'MONTH', timeZone = 'Asia/Kolkata') {
  if (!calendarId) return null;
  const cleanId = calendarId.trim();
  const encodedId = encodeURIComponent(cleanId);
  const encodedTz = encodeURIComponent(timeZone || 'Asia/Kolkata');
  return `https://calendar.google.com/calendar/embed?src=${encodedId}&ctz=${encodedTz}&mode=${mode}&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0&bgcolor=%231a1917`;
}
