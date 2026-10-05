import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { driveUrl } from '../../lib/salonData';
import { ImagePreview, SaveBar } from '../AdminComponents';

const DEFAULT = {
  image_url: '',
  label: 'Our Story',
  heading: 'Where Beauty',
  second_line: 'Meets Excellence.',
  text: 'We are passionate about making every client feel their absolute best.',
  stats: [
    { value: 8, suffix: '+', label: 'Years of Excellence' },
    { value: 500, suffix: '+', label: 'Happy Clients' },
    { value: 15, suffix: '', label: 'Expert Services' },
    { value: 4.9, suffix: '★', label: 'Average Rating' },
  ],
  features: [],
};

export default function AboutEditor() {
  const [data, setData] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newStat, setNewStat] = useState({ value: '', suffix: '', label: '' });
  const [newFeature, setNewFeature] = useState({ title: '', desc: '' });

  useEffect(() => {
    supabase.from('about_settings').select('*').eq('id', 'main').single()
      .then(({ data }) => {
        if (data) setData({ ...DEFAULT, ...data });
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from('about_settings').upsert({
      id: 'main',
      ...data,
      stats: data.stats || [],
      features: data.features || [],
      updated_at: new Date().toISOString(),
    });
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  }

  function updateStat(i, key, val) {
    setData(d => {
      const s = [...d.stats];
      s[i] = { ...s[i], [key]: key === 'value' ? Number(val) : val };
      return { ...d, stats: s };
    });
  }

  function removeStat(i) {
    setData(d => ({ ...d, stats: d.stats.filter((_, idx) => idx !== i) }));
  }

  function addStat() {
    if (!newStat.label) return;
    setData(d => ({ ...d, stats: [...d.stats, { ...newStat, value: Number(newStat.value) || 0 }] }));
    setNewStat({ value: '', suffix: '', label: '' });
  }

  function addFeature() {
    if (!newFeature.title) return;
    setData(d => ({ ...d, features: [...(d.features || []), { ...newFeature }] }));
    setNewFeature({ title: '', desc: '' });
  }

  function removeFeature(i) {
    setData(d => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }));
  }

  if (loading) return <div className="admin-tab-loading">Loading about settings…</div>;

  return (
    <div className="admin-tab">
      {/* Image */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">🖼️ About Section Image</h3>
        <div className="admin-form-group">
          <label className="admin-label">Image URL or Local Path</label>
          <input
            type="text"
            className="admin-input"
            value={data.image_url || ''}
            onChange={e => setData(d => ({ ...d, image_url: e.target.value }))}
            placeholder="https://drive.google.com/... or /images/salon-interior.jpg"
          />
        </div>
        {data.image_url && <ImagePreview src={driveUrl(data.image_url)} label="About Image Preview" />}
      </div>

      {/* Text */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">✍️ Section Text</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Label (small text above heading)</label>
            <input className="admin-input" value={data.label || ''} onChange={e => setData(d => ({ ...d, label: e.target.value }))} placeholder="Our Story" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Heading Line 1</label>
            <input className="admin-input" value={data.heading || ''} onChange={e => setData(d => ({ ...d, heading: e.target.value }))} placeholder="Where Beauty" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Heading Line 2 (italic)</label>
            <input className="admin-input" value={data.second_line || ''} onChange={e => setData(d => ({ ...d, second_line: e.target.value }))} placeholder="Meets Excellence." />
          </div>
        </div>
        <div className="admin-form-group">
          <label className="admin-label">Body Text</label>
          <textarea
            className="admin-input admin-textarea"
            rows={4}
            value={data.text || ''}
            onChange={e => setData(d => ({ ...d, text: e.target.value }))}
            placeholder="Tell your story…"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">📊 Stats</h3>
        <div className="admin-stats-grid">
          {(data.stats || []).map((s, i) => (
            <div key={i} className="admin-stat-row">
              <input className="admin-input admin-input--sm" type="number" value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="Value" />
              <input className="admin-input admin-input--sm" value={s.suffix} onChange={e => updateStat(i, 'suffix', e.target.value)} placeholder="Suffix (+, ★)" />
              <input className="admin-input" value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Label" />
              <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeStat(i)}>✕</button>
            </div>
          ))}
        </div>
        <div className="admin-stats-grid admin-add-row" style={{ marginTop: 12 }}>
          <input className="admin-input admin-input--sm" type="number" value={newStat.value} onChange={e => setNewStat(s => ({ ...s, value: e.target.value }))} placeholder="Value" />
          <input className="admin-input admin-input--sm" value={newStat.suffix} onChange={e => setNewStat(s => ({ ...s, suffix: e.target.value }))} placeholder="Suffix" />
          <input className="admin-input" value={newStat.label} onChange={e => setNewStat(s => ({ ...s, label: e.target.value }))} placeholder="Label" />
          <button className="admin-btn admin-btn--secondary" onClick={addStat}>Add</button>
        </div>
      </div>

      {/* Features */}
      <div className="admin-section-card">
        <h3 className="admin-section-title">⭐ Feature Points</h3>
        {(data.features || []).map((f, i) => (
          <div key={i} className="admin-feature-row">
            <div style={{ flex: 1 }}>
              <input className="admin-input" value={f.title} onChange={e => setData(d => { const fs = [...d.features]; fs[i] = { ...fs[i], title: e.target.value }; return { ...d, features: fs }; })} placeholder="Feature title" />
              <input className="admin-input" style={{ marginTop: 6 }} value={f.desc || ''} onChange={e => setData(d => { const fs = [...d.features]; fs[i] = { ...fs[i], desc: e.target.value }; return { ...d, features: fs }; })} placeholder="Feature description" />
            </div>
            <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeFeature(i)}>✕</button>
          </div>
        ))}
        <div className="admin-feature-row admin-add-row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <input className="admin-input" value={newFeature.title} onChange={e => setNewFeature(f => ({ ...f, title: e.target.value }))} placeholder="New feature title" />
            <input className="admin-input" style={{ marginTop: 6 }} value={newFeature.desc} onChange={e => setNewFeature(f => ({ ...f, desc: e.target.value }))} placeholder="New feature description" />
          </div>
          <button className="admin-btn admin-btn--secondary" onClick={addFeature}>Add</button>
        </div>
      </div>

      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  );
}
