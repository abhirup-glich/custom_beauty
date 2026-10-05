import { motion } from 'framer-motion';
import { Check, ArrowRight, MessageCircle } from 'lucide-react';
import { formatPrice, whatsappLink } from '../salon';
import './PackagesSection.css';

export default function PackagesSection({ onBookClick, salonData }) {
  const salon = salonData || {};
  const { packages = [] } = salon;
  const getWhatsAppUrl = (pkg) => whatsappLink(
    `Hi! I'm interested in the *${pkg.name}* package at ${salon.name} (${formatPrice(pkg.price)}). Could you help me book it?`
  );

  return (
    <section className="packages-section section" id="packages">
      <div className="container">
        <div className="section-header section-header--center">
          <span className="text-label">Curated Packages</span>
          <h2 className="text-section-title">Complete beauty,<br />all in one.</h2>
          <div className="divider divider--center" />
          <p>Handpicked service combinations for a total beauty experience — at special package prices.</p>
        </div>

        <div className="packages-grid">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              className={`package-card ${pkg.popular ? 'package-card--popular' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
            >
              {pkg.popular && (
                <div className="package-card__popular-label">Most Popular</div>
              )}

              <div className="package-card__header">
                <span className="package-card__name">{pkg.name}</span>
                <div className="package-card__price-wrap">
                  <span className="package-card__price">{formatPrice(pkg.price)}</span>
                  {pkg.originalPrice && (
                    <span className="package-card__original-price">{formatPrice(pkg.originalPrice)}</span>
                  )}
                  {pkg.priceNote && <span className="package-card__price-note">{pkg.priceNote}</span>}
                </div>
                {pkg.savingsLabel && (
                  <span className="package-card__savings">{pkg.savingsLabel}</span>
                )}
                <p className="package-card__desc">{pkg.description}</p>
                {pkg.duration && <div className="package-card__duration">⏱ {pkg.duration}</div>}
              </div>

              <ul className="package-card__features">
                {pkg.features.map((f) => (
                  <li key={f} className="package-card__feature">
                    <span className="package-card__feature-icon"><Check size={12} /></span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="package-card__actions">
                <button
                  className={`btn package-card__cta ${pkg.popular ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onBookClick()}
                  id={`book-pkg-${pkg.id}`}
                >
                  Book Package <ArrowRight size={15} />
                </button>
                <a
                  href={getWhatsAppUrl(pkg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="package-card__wa"
                  aria-label={`Enquire about ${pkg.name} package on WhatsApp`}
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
