import { motion, AnimatePresence } from 'framer-motion';
import BookingFlow from '../components/booking/BookingFlow';
import './BookingSection.css';

export default function BookingSection({ isOpen, initialService, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="booking-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="booking-modal"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            aria-label="Book an appointment"
            id="booking"
          >
            <div className="booking-modal__handle" />
            <BookingFlow initialService={initialService} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
