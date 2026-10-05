import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, MessageCircle, CheckCircle2, Calendar } from 'lucide-react';
import salon, { formatPrice, whatsappLink, isClosedOn, timeSlotsFor } from '../../salon';
import { supabase } from '../../lib/supabase';
import { createGoogleCalendarUrl } from '../../lib/googleCalendar';
import Avatar from '../Avatar';
import './BookingFlow.css';

const { services, team } = salon;
const formatDate = (d) => d?.toLocaleDateString(salon.locale, { weekday: 'long', day: 'numeric', month: 'long' });

// There is no backend: the booking is handed to the salon as a pre-filled WhatsApp message.
function bookingWhatsAppUrl({ service, professional, date, time, customer }) {
  return whatsappLink(
    `Hi ${salon.name}! I'd like to book an appointment:\n\n` +
    `✂ *${service?.name}* (${formatPrice(service?.price)})\n` +
    (professional ? `👤 ${professional.name}\n` : '') +
    `📅 ${formatDate(date)}, ${time}\n\n` +
    `Name: ${customer.name}\nPhone: ${customer.phone}` +
    (customer.email ? `\nEmail: ${customer.email}` : '') +
    `\n\nPlease confirm my appointment. Thank you!`
  );
}

// ── Step Components ──────────────────────────────────────────

function StepService({ selected, onSelect }) {
  return (
    <div className="booking-step">
      <h3 className="booking-step__title">Choose a Service</h3>
      <div className="booking-step__service-list">
        {services.map((s) => (
          <button
            key={s.id}
            className={`booking-service-item ${selected?.id === s.id ? 'selected' : ''}`}
            onClick={() => onSelect(s)}
          >
            <div className="booking-service-item__img-wrap">
              <img src={s.image} alt={s.name} loading="lazy" />
            </div>
            <div className="booking-service-item__info">
              <div className="booking-service-item__name">{s.name}</div>
              <div className="booking-service-item__meta">
                {formatPrice(s.price)}{s.duration && ` · ${s.duration}`}
                {s.popular && <span className="booking-service-item__popular">Popular</span>}
              </div>
            </div>
            <div className={`booking-service-item__radio ${selected?.id === s.id ? 'checked' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function StepProfessional({ selected, onSelect }) {
  const allPros = [
    { id: 'any', name: 'Any Available', role: 'Best match for your service', image: salon.about.image },
    ...team,
  ];
  return (
    <div className="booking-step">
      <h3 className="booking-step__title">Choose a Professional</h3>
      <div className="booking-step__pro-list">
        {allPros.map((p) => (
          <button
            key={p.id}
            className={`booking-pro-item ${selected?.id === p.id ? 'selected' : ''}`}
            onClick={() => onSelect(p)}
          >
            <Avatar src={p.image} name={p.name} className="booking-pro-item__avatar" />
            <div className="booking-pro-item__info">
              <div className="booking-pro-item__name">{p.name}</div>
              <div className="booking-pro-item__role">{p.role || p.specialization}</div>
            </div>
            <div className={`booking-service-item__radio ${selected?.id === p.id ? 'checked' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDate({ selected, onSelect }) {
  const today = new Date();
  const dates = Array.from({ length: salon.booking.daysAhead }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return (
    <div className="booking-step">
      <h3 className="booking-step__title">Choose a Date</h3>
      <div className="booking-dates">
        {dates.map((d) => {
          const isSelected = selected?.toDateString() === d.toDateString();
          const closed = isClosedOn(d);
          return (
            <button
              key={d.toDateString()}
              className={`booking-date-btn ${isSelected ? 'selected' : ''} ${closed ? 'disabled' : ''}`}
              onClick={() => !closed && onSelect(d)}
              disabled={closed}
            >
              <span className="booking-date-btn__day">{dayNames[d.getDay()]}</span>
              <span className="booking-date-btn__num">{d.getDate()}</span>
              <span className="booking-date-btn__month">{d.toLocaleString('default', { month: 'short' })}</span>
              {closed && <span className="booking-date-btn__closed">Closed</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTime({ date, selected, onSelect }) {
  const slots = timeSlotsFor(date);
  return (
    <div className="booking-step">
      <h3 className="booking-step__title">Choose a Time</h3>
      <div className="booking-times">
        {slots.map((t) => (
          <button
            key={t}
            className={`booking-time-btn ${selected === t ? 'selected' : ''}`}
            onClick={() => onSelect(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepCustomer({ data, onChange }) {
  return (
    <div className="booking-step">
      <h3 className="booking-step__title">Your Information</h3>
      <div className="booking-customer-form">
        <div className="form-group">
          <label className="form-label" htmlFor="cust-name">Full Name</label>
          <input
            id="cust-name"
            type="text"
            className="form-input"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Priya Sharma"
            required
            autoComplete="name"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cust-phone">Phone Number</label>
          <input
            id="cust-phone"
            type="tel"
            className="form-input"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+91 98765 43210"
            required
            autoComplete="tel"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cust-email">Email <span style={{ fontWeight: 400, color: 'var(--color-text-xlight)' }}>(optional)</span></label>
          <input
            id="cust-email"
            type="email"
            className="form-input"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </div>
      </div>
    </div>
  );
}

function StepConfirmation({ booking }) {
  const { service, professional, date, time, customer } = booking;
  return (
    <div className="booking-step">
      <h3 className="booking-step__title">Confirm Your Appointment</h3>
      <div className="booking-confirm-card">
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Service</span>
          <span className="booking-confirm-value">{service?.name}</span>
        </div>
        {professional && (
          <div className="booking-confirm-row">
            <span className="booking-confirm-label">Professional</span>
            <span className="booking-confirm-value">{professional.name}</span>
          </div>
        )}
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Date</span>
          <span className="booking-confirm-value">{formatDate(date)}</span>
        </div>
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Time</span>
          <span className="booking-confirm-value">{time}</span>
        </div>
        <div className="booking-confirm-row booking-confirm-row--price">
          <span className="booking-confirm-label">Estimated Price</span>
          <span className="booking-confirm-price">{formatPrice(service?.price)}</span>
        </div>
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Name</span>
          <span className="booking-confirm-value">{customer?.name}</span>
        </div>
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Phone</span>
          <span className="booking-confirm-value">{customer?.phone}</span>
        </div>
      </div>
      <p className="booking-confirm-note">
        Tapping confirm opens WhatsApp with your booking details — just press send.
        {salon.cancellationPolicy && <><br />{salon.cancellationPolicy}</>}
      </p>
    </div>
  );
}

function BookingSuccess({ booking, onClose }) {
  const waUrl = bookingWhatsAppUrl(booking);

  const durationMatch = booking.service?.duration ? String(booking.service.duration).match(/\d+/) : null;
  const durationMinutes = durationMatch ? parseInt(durationMatch[0], 10) : 60;

  const gCalUrl = createGoogleCalendarUrl({
    title: `${booking.service?.name || 'Appointment'} — ${salon.name}`,
    description: `Service: ${booking.service?.name}\nPrice: ${formatPrice(booking.service?.price)}\nProfessional: ${booking.professional?.name || 'Any Available'}\nClient: ${booking.customer?.name} (${booking.customer?.phone})\n\nSalon: ${salon.name}\nAddress: ${salon.address.full}`,
    location: salon.address.full,
    startDate: booking.date,
    startTime: booking.time,
    durationMinutes: durationMinutes,
  });

  return (
    <div className="booking-success">
      <motion.div
        className="booking-success__icon"
        animate={{ scale: [0.5, 1.15, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 0.6, ease: 'backOut' }}
      >
        <CheckCircle2 size={52} color="var(--color-success)" strokeWidth={1.5} />
      </motion.div>
      <h2 className="booking-success__title">Appointment Booked!</h2>
      <p className="booking-success__sub">
        Your appointment is registered. Add it to your Google Calendar or send WhatsApp confirmation.
      </p>

      <div className="booking-success__card">
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Service</span>
          <span className="booking-confirm-value">{booking.service?.name}</span>
        </div>
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Date</span>
          <span className="booking-confirm-value">{formatDate(booking.date)}</span>
        </div>
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Time</span>
          <span className="booking-confirm-value">{booking.time}</span>
        </div>
        <div className="booking-confirm-row">
          <span className="booking-confirm-label">Salon</span>
          <span className="booking-confirm-value">{salon.address.full}</span>
        </div>
      </div>

      <div className="booking-success__actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a
          href={gCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: 600,
            padding: '12px 20px',
            borderRadius: '10px',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(66,133,244,0.3)',
          }}
          id="booking-success-gcal"
        >
          <Calendar size={18} />
          📅 Add to Google Calendar
        </a>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
          id="booking-success-whatsapp"
        >
          <MessageCircle size={17} />
          Confirm on WhatsApp
        </a>
        <button className="btn btn-outline" onClick={onClose} id="booking-success-done">
          Done
        </button>
      </div>
    </div>
  );
}

// ── Main Booking Flow ─────────────────────────────────────────

const STEPS = [
  { key: 'service', label: 'Service' },
  team.length > 0 && { key: 'professional', label: 'Professional' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'customer', label: 'Your Info' },
  { key: 'confirm', label: 'Confirm' },
].filter(Boolean);
const LAST = STEPS.length - 1;

export default function BookingFlow({ initialService, onClose }) {
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [booking, setBooking] = useState({
    service: initialService || null,
    professional: null,
    date: null,
    time: null,
    customer: { name: '', phone: '', email: '' },
  });
  const [booked, setBooked] = useState(false);
  const bodyRef = useRef(null);
  const current = STEPS[step].key;

  const canProceed = () => {
    switch (current) {
      case 'service': return !!booking.service;
      case 'professional': return !!booking.professional;
      case 'date': return !!booking.date;
      case 'time': return !!booking.time;
      case 'customer': return !!booking.customer.name.trim() && !!booking.customer.phone.trim();
      case 'confirm': return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step === LAST) {
      // Save appointment record to database
      try {
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = booking.date instanceof Date
          ? `${booking.date.getFullYear()}-${pad(booking.date.getMonth() + 1)}-${pad(booking.date.getDate())}`
          : String(booking.date);

        await supabase.from('bookings').insert({
          service_name: booking.service?.name,
          service_price: booking.service?.price || 0,
          duration: booking.service?.duration || '60 min',
          professional_name: booking.professional?.name || 'Any Available',
          booking_date: dateStr,
          booking_time: booking.time,
          customer_name: booking.customer?.name,
          customer_phone: booking.customer?.phone,
          customer_email: booking.customer?.email || '',
          notes: '',
          status: 'confirmed',
        });
      } catch (err) {
        console.error('Failed to save booking to database:', err);
      }

      window.open(bookingWhatsAppUrl(booking), '_blank', 'noopener');
      setBooked(true);
      return;
    }
    setStep((s) => s + 1);
    bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (step === 0) { onClose(); return; }
    setStep((s) => s - 1);
  };

  return (
    <div className="booking-flow">
      {/* Header */}
      <div className="booking-flow__header">
        <button className="booking-flow__back" onClick={handleBack} aria-label="Go back">
          <ChevronLeft size={20} />
          {step === 0 ? 'Close' : 'Back'}
        </button>
        <div className="booking-flow__title">
          {booked ? 'Send to confirm' : `Step ${step + 1} of ${STEPS.length}`}
        </div>
        <button className="booking-flow__close" onClick={onClose} aria-label="Close booking">
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      {!booked && (
        <div className="booking-flow__progress" aria-label="Booking progress">
          <motion.div
            className="booking-flow__progress-fill"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}

      {/* Step label */}
      {!booked && (
        <div className="booking-flow__step-label">{STEPS[step].label}</div>
      )}

      {/* Content */}
      <div className="booking-flow__body" ref={bodyRef}>
        <AnimatePresence mode="wait">
          {booked ? (
            <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <BookingSuccess booking={booking} onClose={onClose} />
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {current === 'service' && <StepService selected={booking.service} onSelect={(s) => setBooking((b) => ({ ...b, service: s }))} />}
              {current === 'professional' && <StepProfessional selected={booking.professional} onSelect={(p) => setBooking((b) => ({ ...b, professional: p }))} />}
              {current === 'date' && <StepDate selected={booking.date} onSelect={(d) => setBooking((b) => ({ ...b, date: d, time: null }))} />}
              {current === 'time' && <StepTime date={booking.date} selected={booking.time} onSelect={(t) => setBooking((b) => ({ ...b, time: t }))} />}
              {current === 'customer' && <StepCustomer data={booking.customer} onChange={(c) => setBooking((b) => ({ ...b, customer: c }))} />}
              {current === 'confirm' && <StepConfirmation booking={booking} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      {!booked && (
        <div className="booking-flow__footer">
          <motion.button
            className="btn btn-primary booking-flow__next"
            onClick={handleNext}
            disabled={!canProceed()}
            whileTap={{ scale: 0.97 }}
            id="booking-next-btn"
          >
            {step === LAST ? 'Confirm on WhatsApp' : 'Continue →'}
          </motion.button>
        </div>
      )}
    </div>
  );
}
