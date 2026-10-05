import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import './ExperienceSection.css';


function CountUp({ target, suffix, duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const isDecimal = !Number.isInteger(target);
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = isDecimal ? (eased * target).toFixed(1) : Math.round(eased * target);
          setVal(current);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

export default function ExperienceSection({ salonData }) {
  const about = (salonData || {}).about || {};
  const features = (about.features || []).map((f, i) => ({ ...f, num: String(i + 1).padStart(2, '0') }));
  const stats = about.stats || [];
  const salon = salonData || {};
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section className="experience-section" ref={sectionRef} id="experience">
      {/* Background image with parallax */}
      <motion.div className="experience-section__bg" style={{ y }}>
        <img src={about.image} alt={`${salon.name} salon interior`} loading="lazy" />
        <div className="experience-section__overlay" />
      </motion.div>

      <div className="experience-section__content container">
        {/* Headline */}
        <div className="experience-section__headline">
          <motion.p
            className="text-label experience-section__label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {about.label}
          </motion.p>
          <motion.h2
            className="experience-section__title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {about.heading}
            <br />
            <em>{about.secondLine}</em>
          </motion.h2>
          <motion.p
            className="experience-section__sub"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {about.text}
          </motion.p>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
        <motion.div
          className="experience-stats"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="experience-stat glass">
              <div className="experience-stat__value">
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div className="experience-stat__label">{s.label}</div>
            </div>
          ))}
        </motion.div>
        )}

        {/* Features */}
        <div className="experience-section__features">
          {features.map((f, i) => (
            <motion.div
              key={f.num}
              className="experience-feature glass"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="experience-feature__num">{f.num}</span>
              <div>
                <h3 className="experience-feature__title">{f.title}</h3>
                <p className="experience-feature__desc">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
