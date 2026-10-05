import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import './Testimonials.css';

export default function Testimonials({ salonData }) {
  const salon = salonData || {};
  const testimonials = salon.testimonials || [];
  const fromGoogle = salon.testimonialsSource === 'google';
  const [active, setActive] = useState(0);
  const autoRef = useRef(null);

  const startAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActive((a) => (a + 1) % testimonials.length);
    }, 5000);
  };

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, []);

  const prev = () => { setActive((a) => (a - 1 + testimonials.length) % testimonials.length); startAuto(); };
  const next = () => { setActive((a) => (a + 1) % testimonials.length); startAuto(); };
  const goTo = (i) => { setActive(i); startAuto(); };

  const t = testimonials[active];

  return (
    <section className="testimonials-section section" id="testimonials">
      <div className="container">
        {/* Header with rating */}
        <div className="section-header section-header--center">
          <span className="text-label">Client Stories</span>
          <h2 className="text-section-title">
            Words from<br />our clients.
          </h2>
          <div className="divider divider--center" />
          {salon.rating && (
            <div className="testimonials-overall">
              <div className="testimonials-overall__stars">{'★'.repeat(Math.round(salon.rating))}</div>
              <div className="testimonials-overall__score">
                {salon.ratingSource === 'google' ? 'Google Rating' : 'Rating'}: {salon.rating} out of 5
              </div>
              {salon.reviewCount && <div className="testimonials-overall__count">{salon.reviewCount} customer reviews</div>}
              {salon.reviewUrl && (
                <a
                  href={salon.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="testimonials-overall__link"
                  aria-label="View and write reviews on Google"
                >
                  Review us on Google <ExternalLink size={13} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="testimonials-carousel" aria-live="polite" aria-label="Client testimonials">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="testimonial-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="testimonial-card__stars" aria-label={`${t.rating} stars`}>
                {'★'.repeat(t.rating)}
              </div>
              <blockquote className="testimonial-card__quote">"{t.text}"</blockquote>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar" aria-hidden="true">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="testimonial-card__name">— {t.name}</div>
                  <div className="testimonial-card__role">{t.role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="testimonials-controls">
            <button className="testimonials-btn" onClick={prev} aria-label="Previous testimonial">←</button>
            <div className="testimonials-dots" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testimonials-dot ${i === active ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-selected={i === active}
                  role="tab"
                />
              ))}
            </div>
            <button className="testimonials-btn" onClick={next} aria-label="Next testimonial">→</button>
          </div>
        </div>

        {fromGoogle && (
          <p className="testimonials-note">Reviews shown are from our Google Business Profile.</p>
        )}
      </div>
    </section>
  );
}
