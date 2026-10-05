import { Home, Scissors, CalendarCheck, Image, MapPin } from 'lucide-react';
import { sections } from '../salon';
import './MobileBottomNav.css';

const navItems = [
  { id: 'home',     label: 'Home',     icon: Home,          href: '#' },
  { id: 'services', label: 'Services', icon: Scissors,       href: '#services' },
  { id: 'book',     label: 'Book',     icon: CalendarCheck,  href: '#booking', primary: true },
  sections.gallery && { id: 'gallery', label: 'Gallery', icon: Image, href: '#gallery' },
  { id: 'more',     label: 'Visit',    icon: MapPin,         href: '#contact' },
].filter(Boolean);

export default function MobileBottomNav({ activeSection, onBookClick }) {
  const handleClick = (item, e) => {
    e.preventDefault();
    if (item.id === 'book') {
      onBookClick();
      return;
    }
    if (item.href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="bottom-nav" aria-label="Mobile bottom navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <a
            key={item.id}
            href={item.href}
            className={`bottom-nav__item ${item.primary ? 'bottom-nav__item--primary' : ''} ${isActive && !item.primary ? 'bottom-nav__item--active' : ''}`}
            onClick={(e) => handleClick(item, e)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav__icon">
              <Icon size={item.primary ? 22 : 20} />
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
