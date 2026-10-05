import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Phone, Star, ChevronDown, X } from 'lucide-react';
import { isOpenNow } from '../salon';
import { getIsOpenNow } from '../lib/hours';
import './TrustBar.css';

export default function TrustBar({ salonData }) {
  const salon = salonData || {};
  const [hoursOpen, setHoursOpen] = useState(false);
  const open = salon.hours ? getIsOpenNow(salon.hours, salon.timezone) : isOpenNow();

  const { address = {} } = salon;
  const fullAddress = address.full || (address.street ? `${address.street}, ${address.city}` : '');
  const [firstPart, ...restParts] = fullAddress.split(',').map((p) => p.trim());
  const locationTitle = address.city || firstPart || 'Visit Us';
  const locationSub = address.city ? (address.street || firstPart) : restParts[0] || 'Get directions';
  const mapsUrl = salon.google?.mapsUrl || salon.mapsUrl || '#';


  return (
    <motion.div
      className="trust-bar"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Rating */}
      {salon.rating && (
      <>
      <a
        href={salon.reviewUrl || mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="trust-item trust-item--rating"
        aria-label={`${salon.rating} out of 5 stars${salon.reviewCount ? `, ${salon.reviewCount} reviews` : ''}`}
      >
        <div className="trust-item__icon trust-item__icon--star">
          <Star size={15} fill="currentColor" />
        </div>
        <div className="trust-item__text">
          <strong>{salon.rating}</strong>
          <span>{salon.reviewCount ? `${salon.reviewCount} reviews` : 'Rating'}</span>
        </div>
      </a>

      <div className="trust-bar__sep" />
      </>
      )}

      {/* Location */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="trust-item"
        aria-label={`Location: ${fullAddress}`}
      >
        <div className="trust-item__icon">
          <MapPin size={15} />
        </div>
        <div className="trust-item__text">
          <strong>{locationTitle}</strong>
          <span>{locationSub}</span>
        </div>
      </a>

      <div className="trust-bar__sep" />

      {/* Hours */}
      {open !== null && (
      <>
      <button
        className="trust-item trust-item--btn"
        onClick={() => setHoursOpen((o) => !o)}
        aria-expanded={hoursOpen}
        aria-label="View opening hours"
        id="hours-toggle"
      >
        <div className="trust-item__icon">
          <Clock size={15} />
        </div>
        <div className="trust-item__text">
          <strong className={`trust-item__status ${open ? 'open' : 'closed'}`}>
            <span className="trust-item__dot" />
            {open ? 'Open Now' : 'Closed'}
          </strong>
          <span>See hours</span>
        </div>
        <ChevronDown size={13} className={`trust-item__chevron ${hoursOpen ? 'rotated' : ''}`} />
      </button>

      <div className="trust-bar__sep" />
      </>
      )}

      {/* Phone */}
      <a
        href={`tel:${salon.phone}`}
        className="trust-item"
        aria-label={`Call us at ${salon.phone}`}
      >
        <div className="trust-item__icon">
          <Phone size={15} />
        </div>
        <div className="trust-item__text">
          <strong>Call Us</strong>
          <span>{salon.phone}</span>
        </div>
      </a>

      {/* Hours dropdown */}
      <AnimatePresence>
        {hoursOpen && (
          <motion.div
            className="trust-hours-panel"
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="trust-hours-panel__header">
              <span>Opening Hours</span>
              <button onClick={() => setHoursOpen(false)} aria-label="Close hours panel">
                <X size={16} />
              </button>
            </div>
            {(salon.hoursDisplay || []).map((h) => (
              <div key={h.days} className="trust-hours-row">
                <span className="trust-hours-row__days">{h.days}</span>
                <span className={`trust-hours-row__time ${h.time === 'Closed' ? 'closed' : ''}`}>
                  {h.time}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
