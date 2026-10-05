import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowDown, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isOpenNow, whatsappLink } from '../salon';
import './Hero.css';

export default function Hero({ onBookClick, onExploreClick, salonData }) {
  const salon = salonData;
  const hero = salon.hero || {};
  const cyclingWords = hero.rotatingWords || ['Glow', 'Radiance', 'Elegance'];

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [wordIndex, setWordIndex] = useState(0);
  const open = isOpenNow();

  useEffect(() => {
    const id = setInterval(() => setWordIndex((i) => (i + 1) % cyclingWords.length), 2200);
    return () => clearInterval(id);
  }, [cyclingWords.length]);

  const whatsappUrl = whatsappLink(`Hi! I'd like to book an appointment at ${salon.name}. Could you help me?`);

  return (
    <section className="hero" id="home" aria-label="Hero section">
      {/* Parallax image */}
      <motion.div className="hero__image-wrap" style={{ y }}>
        <img
          src={hero.image}
          alt={`Beauty treatment at ${salon.name}`}
          className="hero__image"
          loading="eager"
          fetchPriority="high"
        />
        <div className="hero__overlay" />
      </motion.div>

      {/* Content */}
      <motion.div className="hero__content container" style={{ opacity }}>
        <motion.span
          className="text-label hero__label"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {salon.tagline}
        </motion.span>

        <motion.h1
          className="text-hero hero__headline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Your{' '}
          <span className="hero__cycling-wrap">
            <AnimatePresence mode="wait">
              <motion.em
                key={wordIndex}
                className="hero__cycling-word"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {cyclingWords[wordIndex]}
              </motion.em>
            </AnimatePresence>
          </span>
          <br />
          <em>{hero.secondLine}</em>
        </motion.h1>

        <motion.p
          className="hero__subtext"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {hero.subtext}
        </motion.p>

        <motion.div
          className="hero__ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            className="btn btn-primary hero__cta-primary"
            onClick={onBookClick}
            id="hero-book-btn"
          >
            Book Appointment
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp hero__cta-secondary"
            id="hero-whatsapp-btn"
            aria-label="Chat with us on WhatsApp"
          >
            <MessageCircle size={17} />
            WhatsApp Us
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{ opacity, cursor: 'pointer' }}
        onClick={onExploreClick}
        role="button"
        tabIndex={0}
        aria-label="Explore salon services"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} color="rgba(250,247,242,0.7)" />
        </motion.div>
      </motion.div>

      {/* Floating info pill */}
      {salon.rating && (
      <motion.div
        className="hero__pill glass"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="hero__pill-stars">★★★★★</span>
        <div>
          <div className="hero__pill-rating">{salon.rating} / 5</div>
          {salon.reviewCount && (
            <div className="hero__pill-text">
              {salon.reviewCount} {salon.ratingSource === 'google' ? 'Google reviews' : 'happy clients'}
            </div>
          )}
        </div>
      </motion.div>
      )}

      {/* Open/Closed pill */}
      {open !== null && (
      <motion.div
        className={`hero__status-pill ${open ? 'hero__status-pill--open' : 'hero__status-pill--closed'}`}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="hero__status-dot" />
        {open ? 'Open Now' : 'Currently Closed'}
      </motion.div>
      )}
    </section>
  );
}
