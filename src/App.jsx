import { useState, useEffect } from 'react';
import { useSalonData } from './lib/salonData';

// Components
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import FloatingBookButton from './components/FloatingBookButton';
import WhatsAppButton from './components/WhatsAppButton';

// Sections
import Hero from './sections/Hero';
import TrustBar from './sections/TrustBar';
import ServicesSection from './sections/ServicesSection';
import ExperienceSection from './sections/ExperienceSection';
import PackagesSection from './sections/PackagesSection';
import BridalSection from './sections/BridalSection';
import Gallery from './sections/Gallery';
import LocationSection from './sections/LocationSection';
import BookingSection from './sections/BookingSection';

export default function App() {
  const { salonData, loading } = useSalonData();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialService, setInitialService] = useState(null);
  const [activeSection, setActiveSection] = useState('home');

  const openBooking = (service = null) => {
    setInitialService(service || null);
    setBookingOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setInitialService(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const tracked = [
      { id: 'home',     el: document.getElementById('home') },
      { id: 'services', el: document.getElementById('services') },
      { id: 'gallery',  el: document.getElementById('gallery') },
      { id: 'contact',  el: document.getElementById('contact') },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    tracked.forEach(({ el }) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background, #FAF7F2)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--accent, #B88782)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sections = {
    packages:        (salonData.packages?.length ?? 0) > 0,
    bridal:          Boolean(salonData.bridal),
    gallery:         (salonData.gallery?.length ?? 0) > 0,
  };

  return (
    <>
      <Navbar onBookClick={() => openBooking()} salonData={salonData} />

      <main>
        <Hero
          onBookClick={() => openBooking()}
          onExploreClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          salonData={salonData}
        />
        <TrustBar salonData={salonData} />
        <ServicesSection onBookClick={openBooking} salonData={salonData} />
        <ExperienceSection salonData={salonData} />
        {sections.packages && <PackagesSection onBookClick={openBooking} salonData={salonData} />}
        {sections.bridal && <BridalSection salonData={salonData} />}
        {sections.gallery && <Gallery salonData={salonData} />}
        <LocationSection salonData={salonData} />
      </main>

      <Footer salonData={salonData} />

      <FloatingBookButton onClick={() => openBooking()} />
      <WhatsAppButton salonData={salonData} />
      <MobileBottomNav activeSection={activeSection} onBookClick={() => openBooking()} />

      <BookingSection
        isOpen={bookingOpen}
        initialService={initialService}
        onClose={closeBooking}
        salonData={salonData}
      />
    </>
  );
}
