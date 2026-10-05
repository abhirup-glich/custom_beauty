import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSalonData } from '../../lib/salonData';
import { DAY_KEYS, DAY_LABELS, parseHoursObject, groupHours, getIsOpenNow } from '../../lib/hours';
import { SaveBar } from '../AdminComponents';

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

function format12(time24) {
  if (!time24 || time24 === 'closed') return 'Closed';
  const [h, m] = time24.split(':').map(Number);
  const h12 = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const PRESETS = [
  {
    name: '🌟 Standard (Mon Closed, Tue-Sun 10 AM - 8 PM)',
    hours: {
      monday: 'closed',
      tuesday: '10:00-20:00',
      wednesday: '10:00-20:00',
      thursday: '10:00-20:00',
      friday: '10:00-20:00',
      saturday: '10:00-20:00',
      sunday: '10:00-18:00'
    }
  },
  {
    name: '📅 Open All 7 Days (10 AM - 8 PM)',
    hours: {
      monday: '10:00-20:00',
      tuesday: '10:00-20:00',
      wednesday: '10:00-20:00',
      thursday: '10:00-20:00',
      friday: '10:00-20:00',
      saturday: '10:00-20:00',
      sunday: '10:00-20:00'
    }
  },
  {
    name: '☕ Relaxed Hours (11 AM - 9 PM, Mon Closed)',
    hours: {
      monday: 'closed',
      tuesday: '11:00-21:00',
      wednesday: '11:00-21:00',
      thursday: '11:00-21:00',
      friday: '11:00-21:00',
      saturday: '11:00-21:00',
      sunday: '11:00-19:00'
    }
  }
];

export default function HoursEditor() {
  const { salonData, updateSalonData } = useSalonData();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Raw hours representation by day: e.g. { monday: { closed: true, start: '10:00', end: '20:00' } }
  const [schedule, setSchedule] = useState(() => {
    const raw = {};
    const defaultHours = {
      monday: 'closed',
      tuesday: '10:00-20:00',
      wednesday: '10:00-20:00',
      thursday: '10:00-20:00',
      friday: '10:00-20:00',
      saturday: '10:00-20:00',
      sunday: '10:00-18:00'
    };

    DAY_KEYS.forEach(day => {
      raw[day] = { closed: false, start: '10:00', end: '20:00' };
    });

    const source = (salonData && salonData.hours) ? defaultHours : defaultHours;
    Object.keys(source).forEach(day => {
      const val = source[day];
      if (!val || val === 'closed') {
        raw[day] = { closed: true, start: '10:00', end: '20:00' };
      } else {
        const [s, e] = val.split('-');
        raw[day] = { closed: false, start: s || '10:00', end: e || '20:00' };
      }
    });

    return raw;
  });

  const [slotMinutes, setSlotMinutes] = useState(salonData?.booking?.slotMinutes || 60);
  const [daysAhead, setDaysAhead] = useState(salonData?.booking?.daysAhead || 14);
  const [cancellationPolicy, setCancellationPolicy] = useState(
    salonData?.cancellationPolicy || 'Free cancellation up to 2 hours before your appointment.'
  );

  // Live open status
  const currentOpen = getIsOpenNow(salonData?.hours, salonData?.timezone);

  function handleToggleDay(day) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed }
    }));
  }

  function handleTimeChange(day, field, val) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: val }
    }));
  }

  function applyPreset(presetHours) {
    const next = {};
    DAY_KEYS.forEach(day => {
      const val = presetHours[day];
      if (!val || val === 'closed') {
        next[day] = { closed: true, start: '10:00', end: '20:00' };
      } else {
        const [s, e] = val.split('-');
        next[day] = { closed: false, start: s || '10:00', end: e || '20:00' };
      }
    });
    setSchedule(next);
  }

  // Convert schedule state back to salon.json format
  function exportHoursObject() {
    const obj = {};
    DAY_KEYS.forEach(day => {
      const item = schedule[day];
      obj[day] = item.closed ? 'closed' : `${item.start}-${item.end}`;
    });
    return obj;
  }

  async function handleSave() {
    setSaving(true);
    const hoursObj = exportHoursObject();
    const parsedRanges = parseHoursObject(hoursObj);
    const grouped = groupHours(parsedRanges);

    const updatePayload = {
      hours: hoursObj,
      hoursDisplay: grouped,
      cancellationPolicy,
      booking: {
        slotMinutes: Number(slotMinutes),
        daysAhead: Number(daysAhead)
      }
    };

    // 1. Update React Context + LocalStorage
    updateSalonData(updatePayload);

    // 2. Try saving to Supabase if configured
    if (supabase) {
      try {
        await supabase.from('site_settings').upsert({
          id: 'main',
          hours: hoursObj,
          cancellation_policy: cancellationPolicy,
          days_ahead: Number(daysAhead),
          slot_minutes: Number(slotMinutes),
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Supabase hours update skipped/failed, saved to local storage:', err);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  return (
    <div className="admin-tab">
      <div className="admin-super-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,168,67,0.12)', borderColor: 'rgba(212,168,67,0.3)', color: 'var(--adm-text)' }}>
        <div>
          ⏰ <strong>Operating Hours & Schedule</strong> — Set when your salon is open. Updates live website status instantly!
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '20px', background: currentOpen ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', border: currentOpen ? '1px solid #4ade80' : '1px solid #f87171', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentOpen ? '#4ade80' : '#f87171', display: 'inline-block' }} />
          {currentOpen ? 'Open Right Now' : 'Closed Right Now'}
        </div>
      </div>

      {/* Quick 1-Click Presets */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">⚡ 1-Click Schedule Presets</h3>
        <p className="admin-section-hint">Click any preset to fill the entire week in 1 second:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => applyPreset(p.hours)}
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday List */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">📅 Daily Schedule</h3>
        <p className="admin-section-hint">Toggle any day between Open or Closed, then choose opening & closing times:</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {DAY_KEYS.map((day, idx) => {
            const item = schedule[day] || { closed: false, start: '10:00', end: '20:00' };
            const label = DAY_LABELS[idx];

            return (
              <div
                key={day}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: item.closed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                  border: item.closed ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(184,135,130,0.3)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                {/* Day name & toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '160px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: item.closed ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)',
                      color: item.closed ? '#f87171' : '#4ade80'
                    }}
                  >
                    {item.closed ? '✕ Closed' : '✓ Open'}
                  </button>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: item.closed ? 'var(--adm-text-3)' : 'var(--adm-text)' }}>
                    {label}
                  </span>
                </div>

                {/* Time selection if open */}
                {!item.closed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      className="admin-input"
                      style={{ width: '110px', padding: '6px 10px', fontSize: '0.85rem' }}
                      value={item.start}
                      onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                    >
                      {TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{format12(t)}</option>
                      ))}
                    </select>
                    <span style={{ color: 'var(--adm-text-3)', fontSize: '0.85rem' }}>to</span>
                    <select
                      className="admin-input"
                      style={{ width: '110px', padding: '6px 10px', fontSize: '0.85rem' }}
                      value={item.end}
                      onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                    >
                      {TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{format12(t)}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--adm-text-3)', fontStyle: 'italic' }}>
                    Closed all day
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Rules & Cancellation Policy */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">📋 Booking Rules & Policies</h3>
        <p className="admin-section-hint">Control how clients book appointments and what policies they see:</p>

        <div className="admin-form-row" style={{ marginTop: '12px' }}>
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label className="admin-label">Appointment Slot Step</label>
            <select
              className="admin-input"
              value={slotMinutes}
              onChange={(e) => setSlotMinutes(Number(e.target.value))}
            >
              <option value={30}>Every 30 Minutes</option>
              <option value={45}>Every 45 Minutes</option>
              <option value={60}>Every 60 Minutes (Standard)</option>
              <option value={90}>Every 90 Minutes</option>
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-3)', marginTop: 4 }}>
              How frequently time slots appear on the booking calendar.
            </span>
          </div>

          <div className="admin-form-group" style={{ flex: 1 }}>
            <label className="admin-label">Book In Advance Limit</label>
            <select
              className="admin-input"
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
            >
              <option value={7}>Up to 7 Days Ahead</option>
              <option value={14}>Up to 14 Days Ahead (Standard)</option>
              <option value={30}>Up to 30 Days Ahead</option>
              <option value={60}>Up to 60 Days Ahead</option>
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-3)', marginTop: 4 }}>
              How many days into the future clients are allowed to book.
            </span>
          </div>
        </div>

        <div className="admin-form-group" style={{ marginTop: '10px' }}>
          <label className="admin-label">Cancellation & Rescheduling Policy</label>
          <input
            className="admin-input"
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            placeholder="Free cancellation up to 2 hours before your appointment."
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-3)', marginTop: 4 }}>
            Shown on the final booking confirmation step.
          </span>
        </div>
      </div>

      <SaveBar onSave={handleSave} saving={saving} saved={saved} label="Save Schedule & Policies" />
    </div>
  );
}
