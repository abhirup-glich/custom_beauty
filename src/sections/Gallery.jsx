import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import './Gallery.css';

export default function Gallery({ salonData }) {
  const allImages = (salonData || {}).gallery || [];
  const categories = (salonData || {}).galleryCategories || ['All'];
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const filtered = activeCategory === 'All'
    ? allImages
    : allImages.filter((img) => img.category === activeCategory);

  const openLightbox = (globalIdx) => setLightboxIdx(globalIdx);
  const closeLightbox = () => setLightboxIdx(null);

  const prev = () => setLightboxIdx((i) => (i - 1 + filtered.length) % filtered.length);
  const next = () => setLightboxIdx((i) => (i + 1) % filtered.length);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, filtered.length]);

  const lightboxImg = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  return (
    <section className="gallery-section section" id="gallery">
      <div className="container">
        <div className="section-header section-header--center">
          <span className="text-label">Gallery</span>
          <h2 className="text-section-title">Beauty,<br />in every frame.</h2>
          <div className="divider divider--center" />
        </div>

        {/* Category filter */}
        {categories.length > 2 && (
        <div className="gallery-cats" role="tablist" aria-label="Gallery categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`gallery-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
              id={`gallery-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className="gallery-grid container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filtered.map((img, i) => (
            <motion.div
              key={`${activeCategory}-${i}`}
              className="gallery-item"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => openLightbox(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(i)}
              aria-label={`View ${img.alt}`}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
              <div className="gallery-item__overlay">
                <ZoomIn size={22} color="white" />
                <span className="gallery-item__cat">{img.category}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <>
            <motion.div
              className="lightbox-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            />
            <motion.div
              className="lightbox"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              role="dialog"
              aria-modal="true"
              aria-label="Image viewer"
            >
              <button className="lightbox__close" onClick={closeLightbox} aria-label="Close image viewer">
                <X size={20} />
              </button>
              <button className="lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous image">
                <ChevronLeft size={22} />
              </button>
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIdx}
                  src={lightboxImg.src}
                  alt={lightboxImg.alt}
                  className="lightbox__image"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              <button className="lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next image">
                <ChevronRight size={22} />
              </button>
              <div className="lightbox__footer">
                <p className="lightbox__caption">
                  {lightboxImg.alt}
                  {lightboxImg.credit && <small> · Photo: {lightboxImg.credit}</small>}
                </p>
                <span className="lightbox__counter">{lightboxIdx + 1} / {filtered.length}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
