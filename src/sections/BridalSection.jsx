import { motion } from 'framer-motion';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import salon, { whatsappLink } from '../salon';
import './BridalSection.css';

const { bridal } = salon;

const FIELDS = [
  ['name', 'Name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['date', 'Event date'],
  ['type', 'Event type'],
  ['functions', 'Functions'],
  ['budget', 'Budget'],
  ['notes', 'Notes'],
];

export default function BridalSection() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sends the enquiry to the salon's WhatsApp — there is no backend.
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const lines = FIELDS
      .filter(([key]) => String(data.get(key) || '').trim())
      .map(([key, label]) => `${label}: ${String(data.get(key)).trim()}`);
    window.open(whatsappLink(`Hi ${salon.name}! I'd like a bridal consultation.\n\n${lines.join('\n')}`), '_blank', 'noopener');
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); }, 3000);
  };

  return (
    <section className="bridal-section" id="bridal">
      <div className="bridal-section__image-wrap">
        <img src={bridal.image} alt={`Bridal look by ${salon.name}`} loading="lazy" />
        <div className="bridal-section__overlay" />
      </div>

      <div className="bridal-section__content container">
        <motion.div
          className="bridal-section__card glass"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        >
          <span className="text-label">Bridal Services</span>
          <h2 className="bridal-section__title">
            {bridal.heading}
            <br />
            <em>{bridal.secondLine}</em>
          </h2>
          <p className="bridal-section__sub">
            {bridal.text}
          </p>
          <div className="bridal-section__points">
            {bridal.points.map((point) => <span key={point}>✦ {point}</span>)}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            id="bridal-consult-btn"
          >
            Plan My Bridal Look
          </button>
        </motion.div>
      </div>

      {/* Bridal consultation form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} />
            <motion.div
              className="bridal-form-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              role="dialog"
              aria-modal="true"
              aria-label="Bridal consultation form"
            >
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowForm(false)} aria-label="Close form"><X size={20} /></button>

              <div className="bridal-form-sheet__body">
                <h3 className="bridal-form-sheet__title">Plan Your Bridal Look</h3>
                <p className="bridal-form-sheet__sub">Fill in the details below and send them to us on WhatsApp.</p>

                {!submitted ? (
                  <form className="bridal-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="bridal-name">Your Name</label>
                        <input id="bridal-name" name="name" type="text" className="form-input" placeholder="Priya Sharma" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="bridal-phone">Phone Number</label>
                        <input id="bridal-phone" name="phone" type="tel" className="form-input" placeholder="+91 98765 43210" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="bridal-email">Email Address</label>
                      <input id="bridal-email" name="email" type="email" className="form-input" placeholder="you@email.com" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="bridal-date">Event Date</label>
                        <input id="bridal-date" name="date" type="date" className="form-input" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="bridal-type">Event Type</label>
                        <select id="bridal-type" name="type" className="form-input">
                          <option value="">Select...</option>
                          {bridal.eventTypes.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="bridal-functions">Number of Functions</label>
                      <input id="bridal-functions" name="functions" type="number" min="1" max="10" className="form-input" placeholder="3" />
                    </div>
                    {bridal.budgetOptions.length > 0 && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="bridal-budget">Budget Range</label>
                        <select id="bridal-budget" name="budget" className="form-input">
                          <option value="">Select...</option>
                          {bridal.budgetOptions.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label" htmlFor="bridal-notes">Additional Notes</label>
                      <textarea id="bridal-notes" name="notes" className="form-input" rows="3" placeholder="Tell us your vision, inspirations, or any specific requirements..." />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Send on WhatsApp
                    </button>
                  </form>
                ) : (
                  <motion.div
                    className="bridal-form__success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="bridal-form__success-icon">✨</div>
                    <h4>Almost there!</h4>
                    <p>Tap send in WhatsApp and our bridal team will get back to you.</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
