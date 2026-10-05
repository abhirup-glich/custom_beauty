import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import './FloatingBookButton.css';

export default function FloatingBookButton({ onClick }) {
  const [hidden, setHidden] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setShrunk(latest > 200);
    // Hide when near bottom (booking section area)
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    setHidden(latest > docHeight - winHeight * 2.5);
  });

  return (
    <motion.button
      className={`float-book-btn ${shrunk ? 'shrunk' : ''}`}
      onClick={onClick}
      animate={{ y: hidden ? 120 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      whileTap={{ scale: 0.94 }}
      aria-label="Book an appointment"
      id="float-book-btn"
    >
      <CalendarCheck size={shrunk ? 20 : 18} />
      {!shrunk && <span>Book Now</span>}
    </motion.button>
  );
}
