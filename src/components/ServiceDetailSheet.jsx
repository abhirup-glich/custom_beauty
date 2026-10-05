import { motion } from 'framer-motion';
import { X, Clock, Check, ArrowRight } from 'lucide-react';
import salon, { formatPrice } from '../salon';
import './ServiceDetailSheet.css';

export default function ServiceDetailSheet({ service, onClose, onBook }) {
  if (!service) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <motion.div
        className="service-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${service.name} details`}
      >
        {/* Drag handle */}
        <div className="sheet-handle" />

        {/* Close */}
        <button className="sheet-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Image */}
        <div className="service-sheet__image-wrap">
          <img
            src={service.image}
            alt={service.name}
            className="service-sheet__image"
            loading="lazy"
          />
          <div className="service-sheet__image-overlay" />
          <div className="service-sheet__image-content">
            <span className="badge badge-rose">{service.category}</span>
            <h2 className="service-sheet__title">{service.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="service-sheet__body">
          {/* Meta row */}
          <div className="service-sheet__meta">
            <div className="service-sheet__price">{formatPrice(service.price)}</div>
            {service.duration && (
              <div className="service-sheet__duration">
                <Clock size={14} />
                {service.duration}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="service-sheet__desc">{service.description}</p>

          {/* What's included */}
          {service.benefits.length > 0 && (
          <div className="service-sheet__includes">
            <h3 className="service-sheet__section-title">What's included</h3>
            <ul className="service-sheet__list">
              {service.benefits.map((b) => (
                <li key={b} className="service-sheet__list-item">
                  <span className="service-sheet__check"><Check size={13} /></span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          )}

          {/* Cancellation */}
          {salon.cancellationPolicy && (
            <div className="service-sheet__policy">
              <p>{salon.cancellationPolicy}</p>
            </div>
          )}

          {/* Book CTA */}
          <button
            className="btn btn-primary service-sheet__book-btn"
            onClick={onBook}
            id={`book-${service.id}`}
          >
            Book this Service <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
