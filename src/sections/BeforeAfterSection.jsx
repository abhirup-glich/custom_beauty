import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import './BeforeAfterSection.css';

function SliderCard({ item }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const getPosition = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 50;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseMove = (e) => { if (dragging.current) setPosition(getPosition(e.clientX)); };
  const onMouseUp = () => { dragging.current = false; };

  const onTouchStart = () => { dragging.current = true; };
  const onTouchMove = (e) => {
    if (dragging.current) setPosition(getPosition(e.touches[0].clientX));
  };
  const onTouchEnd = () => { dragging.current = false; };

  return (
    <div
      className="ba-slider"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label={`Before and after: ${item.label}`}
      role="img"
    >
      {/* After (background) */}
      <img src={item.after} alt={item.afterAlt} className="ba-slider__img ba-slider__img--after" draggable={false} />

      {/* Before (clipped) */}
      <div className="ba-slider__before-wrap" style={{ width: `${position}%` }}>
        <img
          src={item.before}
          alt={item.beforeAlt}
          className="ba-slider__img ba-slider__img--before"
          style={{ width: containerRef.current?.offsetWidth || 400 }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="ba-slider__label ba-slider__label--before">BEFORE</div>
      <div className="ba-slider__label ba-slider__label--after">AFTER</div>

      {/* Handle */}
      <div
        className="ba-slider__handle"
        style={{ left: `${position}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        role="slider"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Drag to compare before and after"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 2));
          if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2));
        }}
      >
        <div className="ba-slider__handle-line" />
        <div className="ba-slider__handle-circle">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 10L2 10M2 10L5 7M2 10L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 10L18 10M18 10L15 7M18 10L15 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="ba-slider__handle-line" />
      </div>

      <p className="ba-slider__caption">{item.label}</p>
    </div>
  );
}

export default function BeforeAfterSection({ salonData }) {
  const rawTrans = salonData?.transformations;
  const allItems = Array.isArray(rawTrans)
    ? rawTrans
    : Array.isArray(rawTrans?.items)
      ? rawTrans.items
      : [];

  const derivedCategories = Array.from(new Set(allItems.map((it) => it.category).filter(Boolean)));
  const categories = (Array.isArray(rawTrans?.categories) && rawTrans.categories.length > 0)
    ? rawTrans.categories
    : (derivedCategories.length > 0 ? derivedCategories : ['All']);

  const [activeCategory, setActiveCategory] = useState(categories[0] || 'All');
  const selectedCategory = categories.includes(activeCategory) ? activeCategory : (categories[0] || 'All');

  const items = allItems.filter((item) => !item.category || item.category === selectedCategory);

  return (
    <section className="ba-section section" id="transformations">
      <div className="container">
        <div className="section-header section-header--center">
          <span className="text-label">Transformations</span>
          <h2 className="text-section-title">See the<br /><em>difference.</em></h2>
          <div className="divider divider--center" />
          <p>Real results from our clients. Drag the slider to reveal the transformation.</p>
        </div>

        {/* Category tabs */}
        {categories.length > 1 && (
        <div className="ba-tabs" role="tablist" aria-label="Transformation categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`ba-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={selectedCategory === cat}
              id={`ba-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>
        )}

        {/* Sliders */}
        <div className="ba-grid">
          {items.map((item, i) => (
            <motion.div
              key={item.id || item.label || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <SliderCard item={item} />
            </motion.div>
          ))}
        </div>

        <p className="ba-disclaimer">
          Results may vary. All transformations shown are from {(salonData || {}).name || 'our'} clients with consent.

        </p>
      </div>
    </section>
  );
}
