import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import salon from '../salon';
import Avatar from '../components/Avatar';
import { X, Award } from 'lucide-react';
import './TeamSection.css';

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState(null);
  const { team } = salon;

  return (
    <section className="team-section section" id="team">
      <div className="container">
        <div className="section-header">
          <span className="text-label">Our Specialists</span>
          <h2 className="text-section-title">The hands
            <br />behind your glow.</h2>
          <div className="divider" />
          <p>Passionate artists with deep expertise in their craft.</p>
        </div>
      </div>

      {/* Horizontal scroll cards */}
      <div className="team-section__scroll-wrap">
        <div className="team-section__cards">
          {team.map((member, i) => (
            <motion.div
              key={member.id}
              className="team-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22,1,0.36,1] }}
              onClick={() => setSelectedMember(member)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedMember(member)}
              aria-label={`View ${member.name}'s profile`}
            >
              <div className="team-card__image-wrap">
                <Avatar src={member.image} name={member.name} />
              </div>
              <div className="team-card__body">
                <h3 className="team-card__name">{member.name}</h3>
                <p className="team-card__role">{member.role}</p>
                <p className="team-card__spec">{member.specialization}</p>
                <span className="team-card__cta">View Profile →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Profile sheet */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div
              className="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
            />
            <motion.div
              className="team-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setSelectedMember(null)}><X size={20} /></button>
              <div className="team-sheet__image-wrap">
                <Avatar src={selectedMember.image} name={selectedMember.name} loading="eager" />
              </div>
              <div className="team-sheet__body">
                <h2 className="team-sheet__name">{selectedMember.name}</h2>
                <p className="team-sheet__role">{selectedMember.role}</p>
                {selectedMember.experience && (
                  <div className="team-sheet__exp">
                    <Award size={14} />
                    {selectedMember.experience} experience
                  </div>
                )}
                <p className="team-sheet__spec">{selectedMember.specialization}</p>
                <p className="team-sheet__bio">{selectedMember.bio}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
