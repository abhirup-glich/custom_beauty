import { Sparkles, Share2, Users, Phone, MapPin, Mail } from 'lucide-react';
import './Footer.css';

export default function Footer({ salonData }) {
  const salon = salonData || {};
  const social = salon.social || {};
  const address = salon.address || {};
  const year = new Date().getFullYear();
  const fullAddress = address.full || (address.street ? `${address.street}, ${address.city}` : '');
  const hasPackages = (salon.packages?.length ?? 0) > 0;
  const hasBridal = salon.bridal?.enabled !== false && Boolean(salon.bridal);
  const hasTransformations = Array.isArray(salon.transformations)
    ? salon.transformations.length > 0
    : ((salon.transformations?.items?.length ?? 0) > 0);
  const hasGallery = (salon.gallery?.length ?? 0) > 0;

  return (
    <footer className="footer">
      <div className="footer__main container">
        <div className="footer__brand">
          <div className="footer__logo">
            {salon.logo
              ? <img src={salon.logo} alt={`${salon.name} logo`} style={{ height: 32, objectFit: 'contain' }} />
              : <><Sparkles size={16} /><span>{salon.name}</span></>
            }
          </div>
          <p className="footer__tagline">{salon.tagline}</p>
          {(social.instagram || social.facebook) && (
            <div className="footer__social">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer__social-btn">
                  <Share2 size={18} />
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer__social-btn">
                  <Users size={18} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="footer__links-group">
          <h4>Explore</h4>
          <nav aria-label="Footer navigation">
            <a href="#services">Services</a>
            {hasPackages && <a href="#packages">Packages</a>}
            {hasBridal && <a href="#bridal">Bridal</a>}
            {hasTransformations && <a href="#before-after">Transformations</a>}
            {hasGallery && <a href="#gallery">Gallery</a>}
            <a href="/admin" style={{ opacity: 0.9, fontWeight: 500 }}>Salon Admin ↗</a>
          </nav>
        </div>

        <div className="footer__links-group">
          <h4>Connect</h4>
          <div className="footer__contact">
            {salon.phone && (
            <a href={`tel:${salon.phone}`} className="footer__contact-item">
              <Phone size={14} />{salon.phone}
            </a>
            )}
            {salon.email && (
              <a href={`mailto:${salon.email}`} className="footer__contact-item">
                <Mail size={14} />{salon.email}
              </a>
            )}
            {fullAddress && (
            <div className="footer__contact-item">
              <MapPin size={14} />{fullAddress}
            </div>
            )}
          </div>
        </div>
      </div>

      <div className="footer__bottom container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p>© {year} {salon.name}. All rights reserved.</p>
        <a href="/admin" style={{ color: 'inherit', opacity: 0.7, fontSize: '0.85rem', textDecoration: 'none' }}>Salon Admin Portal ↗</a>
      </div>
    </footer>
  );
}
