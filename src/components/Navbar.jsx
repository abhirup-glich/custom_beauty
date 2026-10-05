import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onBookClick, salonData }) {
  const salon = salonData || {};
  const sections = {
    services:        (salon.services?.length ?? 0) > 0,
    about:           true,
    packages:        (salon.packages?.length ?? 0) > 0,
    bridal:          salon.bridal?.enabled !== false && Boolean(salon.bridal),
    transformations: (salon.transformations?.length ?? 0) > 0,
    gallery:         (salon.gallery?.length ?? 0) > 0,
  };

  const navLinks = [
    { label: 'Services',        href: '#services',        show: sections.services },
    { label: 'Packages',        href: '#packages',        show: sections.packages },
    { label: 'Bridal',          href: '#bridal',          show: sections.bridal },
    { label: 'Before & After',  href: '#before-after',    show: sections.transformations },
    { label: 'Gallery',         href: '#gallery',         show: sections.gallery },
    { label: 'Contact',         href: '#contact',         show: true },
  ].filter((link) => link.show);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="navbar__inner container">
          {/* Logo */}
          <a href="#" className="navbar__logo" aria-label={`${salon.name} Home`}>
            {salon.logo ? (
              <img
                src={salon.logo}
                alt={salon.name}
                className="navbar__logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const icon = e.currentTarget.parentElement?.querySelector('.navbar__logo-icon');
                  if (icon) icon.style.display = 'flex';
                }}
              />
            ) : null}
            <span
              className="navbar__logo-icon"
              style={{ display: salon.logo ? 'none' : 'flex' }}
            >
              <Sparkles size={16} />
            </span>
            <span className="navbar__logo-text">{salon.name}</span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="navbar__links" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="navbar__link"
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="navbar__actions">
            <button
              className="btn btn-primary navbar__book-btn"
              onClick={onBookClick}
              aria-label="Book an appointment"
            >
              Book Now
            </button>
            <button
              className="navbar__menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="mobile-menu__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {salon.logo && (
                    <img
                      src={salon.logo}
                      alt={salon.name}
                      style={{ height: 28, maxWidth: 100, objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <span className="navbar__logo-text">{salon.name}</span>
                </div>
                <button
                  className="mobile-menu__close"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="mobile-menu__nav">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    className="mobile-menu__link"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              <div className="mobile-menu__footer">
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => { setMenuOpen(false); onBookClick(); }}
                >
                  Book an Appointment
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
