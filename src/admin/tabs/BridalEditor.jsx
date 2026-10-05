import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSalonData, driveUrl } from '../../lib/salonData';
import { ImagePreview, SaveBar } from '../AdminComponents';

const BRIDAL_PRESETS = [
  { label: 'Royal Bride', url: '/images/service-bridal.jpg' },
  { label: 'Elegance Hair', url: '/images/team-aarohi.jpg' },
  { label: 'Glowing Skin', url: '/images/service-facial.jpg' },
  { label: 'Salon Interior', url: '/images/salon-interior.jpg' }
];

export default function BridalEditor() {
  const { salonData, updateSalonData } = useSalonData();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initial = salonData?.bridal || {};
  const [enabled, setEnabled] = useState(initial.enabled !== false);
  const [image, setImage] = useState(initial.image || '/images/service-bridal.jpg');
  const [heading, setHeading] = useState(initial.heading || 'Your big day deserves');
  const [secondLine, setSecondLine] = useState(initial.secondLine || 'your best version.');
  const [text, setText] = useState(
    initial.text || "From skin prep trials to the final look — we're with you every step of the journey to your most beautiful self."
  );

  const [points, setPoints] = useState(
    initial.points && initial.points.length > 0
      ? initial.points
      : ['Bridal Makeup', 'Hair Styling', 'Skin Prep', 'Trial Session', 'Draping Assistance']
  );
  const [newPoint, setNewPoint] = useState('');

  const [eventTypes, setEventTypes] = useState(
    initial.eventTypes && initial.eventTypes.length > 0
      ? initial.eventTypes
      : ['Wedding', 'Engagement', 'Reception', 'Mehendi', 'Sangeet']
  );
  const [newEventType, setNewEventType] = useState('');

  const [budgetOptions, setBudgetOptions] = useState(
    initial.budgetOptions && initial.budgetOptions.length > 0
      ? initial.budgetOptions
      : ['₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+']
  );
  const [newBudget, setNewBudget] = useState('');

  function addPoint() {
    if (!newPoint.trim()) return;
    setPoints(p => [...p, newPoint.trim()]);
    setNewPoint('');
  }

  function removePoint(idx) {
    setPoints(p => p.filter((_, i) => i !== idx));
  }

  function addEventType() {
    if (!newEventType.trim()) return;
    setEventTypes(t => [...t, newEventType.trim()]);
    setNewEventType('');
  }

  function removeEventType(idx) {
    setEventTypes(t => t.filter((_, i) => i !== idx));
  }

  function addBudget() {
    if (!newBudget.trim()) return;
    setBudgetOptions(b => [...b, newBudget.trim()]);
    setNewBudget('');
  }

  function removeBudget(idx) {
    setBudgetOptions(b => b.filter((_, i) => i !== idx));
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    const cleanedImage = driveUrl(image);

    const bridalPayload = {
      enabled,
      image: cleanedImage,
      heading,
      secondLine,
      second_line: secondLine,
      text,
      points,
      eventTypes,
      event_types: eventTypes,
      budgetOptions,
      budget_options: budgetOptions
    };

    // 1. Update React state + localStorage
    updateSalonData({ bridal: bridalPayload });

    // 2. Try saving to Supabase if configured
    if (supabase) {
      try {
        await supabase.from('bridal_settings').upsert({
          id: 'main',
          ...bridalPayload,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Supabase bridal save skipped/failed, saved to local storage:', err);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  return (
    <div className="admin-tab">
      <div className="admin-super-banner" style={{ background: 'rgba(184,135,130,0.15)', borderColor: 'rgba(184,135,130,0.3)', color: 'var(--adm-text)' }}>
        💍 <strong>Bridal Studio & Consultation</strong> — Customize your bridal showcase, packages, and WhatsApp inquiry form!
      </div>

      {/* Visibility Toggle */}
      <div className="admin-section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="admin-section-title" style={{ margin: 0 }}>Show Bridal Section</h3>
          <p className="admin-section-hint" style={{ margin: '4px 0 0 0' }}>
            Turn this ON to show the Bridal Studio section on your homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: enabled ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            color: enabled ? '#4ade80' : 'var(--adm-text-3)'
          }}
        >
          {enabled ? '✓ Enabled (Visible)' : '✕ Disabled (Hidden)'}
        </button>
      </div>

      {/* Bridal Banner Image */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">🖼️ Bridal Showcase Photo</h3>
        <p className="admin-section-hint">Choose a stunning bridal photo that greets visitors in this section:</p>

        <div className="admin-form-group">
          <label className="admin-label">Image Link, Preset, or Upload</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="admin-input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... or /images/service-bridal.jpg"
              style={{ flex: 1 }}
            />
            <label className="admin-btn admin-btn--secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 12px' }}>
              📁 Upload
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-3)', display: 'block', marginBottom: '4px' }}>
              Quick Presets:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {BRIDAL_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                  onClick={() => setImage(p.url)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {image && (
            <div style={{ marginTop: '10px' }}>
              <ImagePreview src={driveUrl(image)} label="Bridal Photo Preview" />
            </div>
          )}
        </div>
      </div>

      {/* Titles & Text */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">✍️ Headlines & Description</h3>

        <div className="admin-form-row">
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label className="admin-label">Heading Line 1</label>
            <input
              className="admin-input"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Your big day deserves"
            />
          </div>
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label className="admin-label">Heading Line 2 (Emphasized)</label>
            <input
              className="admin-input"
              value={secondLine}
              onChange={(e) => setSecondLine(e.target.value)}
              placeholder="your best version."
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Subtext / Bridal Message</label>
          <textarea
            className="admin-input admin-textarea"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="From skin prep trials to the final look..."
          />
        </div>
      </div>

      {/* Bridal Highlights Checklist */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">✦ Service Highlights</h3>
        <p className="admin-section-hint">Bullet points displayed in gold sparkles on the bridal card:</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0' }}>
          {points.map((pt, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(212,168,67,0.15)',
                color: '#d4a843',
                border: '1px solid rgba(212,168,67,0.3)',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: 500
              }}
            >
              ✦ {pt}
              <button
                type="button"
                onClick={() => removePoint(idx)}
                style={{ background: 'none', border: 'none', color: '#d4a843', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <input
            className="admin-input"
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPoint())}
            placeholder="Add new highlight (e.g. HD Airbrush Makeup)..."
            style={{ flex: 1 }}
          />
          <button type="button" className="admin-btn admin-btn--secondary" onClick={addPoint}>
            + Add
          </button>
        </div>
      </div>

      {/* Event Types */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">🎉 Event Types In Inquiry Form</h3>
        <p className="admin-section-hint">Options brides can choose from when requesting a bridal consultation:</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0' }}>
          {eventTypes.map((ev, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--adm-surface-2)',
                color: 'var(--adm-text)',
                border: '1px solid var(--adm-border)',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '0.8rem'
              }}
            >
              {ev}
              <button
                type="button"
                onClick={() => removeEventType(idx)}
                style={{ background: 'none', border: 'none', color: 'var(--adm-text-3)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <input
            className="admin-input"
            value={newEventType}
            onChange={(e) => setNewEventType(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEventType())}
            placeholder="Add event type (e.g. Cocktail Night)..."
            style={{ flex: 1 }}
          />
          <button type="button" className="admin-btn admin-btn--secondary" onClick={addEventType}>
            + Add
          </button>
        </div>
      </div>

      {/* Budget Brackets */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">💰 Budget Brackets</h3>
        <p className="admin-section-hint">Price ranges brides can select from:</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0' }}>
          {budgetOptions.map((bg, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--adm-surface-2)',
                color: 'var(--adm-text)',
                border: '1px solid var(--adm-border)',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '0.8rem'
              }}
            >
              {bg}
              <button
                type="button"
                onClick={() => removeBudget(idx)}
                style={{ background: 'none', border: 'none', color: 'var(--adm-text-3)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <input
            className="admin-input"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBudget())}
            placeholder="Add budget option (e.g. ₹15,000 – ₹30,000)..."
            style={{ flex: 1 }}
          />
          <button type="button" className="admin-btn admin-btn--secondary" onClick={addBudget}>
            + Add
          </button>
        </div>
      </div>

      <SaveBar onSave={handleSave} saving={saving} saved={saved} label="Save Bridal Settings" />
    </div>
  );
}
