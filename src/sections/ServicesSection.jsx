import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { formatPrice } from '../salon';
import ServiceDetailSheet from '../components/ServiceDetailSheet';
import './ServicesSection.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22,1,0.36,1] } }),
};

export default function ServicesSection({ onBookClick, salonData }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedService, setSelectedService] = useState(null);
  const scrollRef = useRef(null);

  const { services = [], serviceCategories = ['All'] } = salonData || {};
  const filtered = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <section className="services-section section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="text-label">{salonData?.headings?.services_label || 'Our Services'}</span>
          <h2 className="text-section-title">{salonData?.headings?.services_title || 'Beauty, your way.'}</h2>
          <div className="divider" />
          <p>{salonData?.headings?.services_sub || 'Discover treatments crafted around you, by specialists who care.'}</p>
        </div>
      </div>

      {/* Category pills */}
      <div className="services-section__categories" ref={scrollRef}>
        {serviceCategories.map((cat) => (
          <button
            key={cat}
            className={`services-section__cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service cards — horizontal scroll on mobile, grid on desktop */}
      <div className="services-section__cards-wrap">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="services-section__cards scroll-x container-overflow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.map((service, i) => (
              <motion.div
                key={service.id}
                className="service-card card"
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                onClick={() => setSelectedService(service)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedService(service)}
                aria-label={`View details for ${service.name}`}
              >
                {/* Image */}
                <div className="service-card__image-wrap">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="service-card__image"
                    loading="lazy"
                  />
                  {service.popular && (
                    <span className="badge badge-espresso service-card__badge">Popular</span>
                  )}
                  <div className="service-card__category">{service.category}</div>
                </div>

                {/* Content */}
                <div className="service-card__body">
                  <h3 className="service-card__name">{service.name}</h3>
                  <p className="service-card__desc">{service.description}</p>
                  <div className="service-card__meta">
                    <div className="service-card__meta-row">
                      <span className="service-card__price">{formatPrice(service.price)}</span>
                      {service.duration && (
                        <span className="service-card__duration">
                          <Clock size={12} />
                          {service.duration}
                        </span>
                      )}
                    </div>
                    <span className="service-card__cta">
                      View Details <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* View all CTA */}
      <div className="container services-section__footer">
        <motion.button
          className="btn btn-outline"
          onClick={() => setActiveCategory('All')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          View All Services <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* Service Detail Sheet */}
      <AnimatePresence>
        {selectedService && (
          <ServiceDetailSheet
            service={selectedService}
            onClose={() => setSelectedService(null)}
            onBook={() => { setSelectedService(null); onBookClick(selectedService); }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
