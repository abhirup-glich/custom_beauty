import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { driveUrl } from '../../lib/salonData';
import { ImagePreview, SaveBar } from '../AdminComponents';

const DEFAULT = {
  image_url: '',
  rotating_words: ['Glow', 'Radiance', 'Elegance', 'Serenity', 'Confidence'],
  second_line: 'Your Confidence.',
  subtext: 'Professional beauty, hair & wellness services designed around you.',
};

export default function HeroEditor() {
  const [data, setData] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wordInput, setWordInput] = useState('');

  useEffect(() => {
    supabase.from('hero_settings').select('*').eq('id', 'main').single()
      .then(({ data }) => {
        if (data) setData({ ...DEFAULT, ...data });
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from('hero_settings').upsert({ id: 'main', ...data, updated_at: new Date().toISOString() });
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  }

  function addWord() {
    if (wordInput.trim()) {
      setData(d => ({ ...d, rotating_words: [...d.rotating_words, wordInput.trim()] }));
      setWordInput('');
    }
  }

  function removeWord(i) {
    setData(d => ({ ...d, rotating_words: d.rotating_words.filter((_, idx) => idx !== i) }));
  }

  if (loading) return <div className="admin-tab-loading">Loading…</div>;

  return (
    <div className="admin-tab">
      <div className="admin-section-card">
        <h3 className="admin-section-title">🖼️ Hero Image</h3>
        <p className="admin-section-hint">
          Paste a Google Drive link, public image URL, or local path (e.g. <code>/images/hero.jpg</code>)
        </p>
        <div className="admin-form-group">
          <label className="admin-label">Image URL or Local Path</label>
          <input
            type="text"
            className="admin-input"
            placeholder="https://drive.google.com/... or /images/hero.jpg"
            value={data.image_url || ''}
            onChange={e => setData(d => ({ ...d, image_url: e.target.value }))}
            id="hero-image-url"
          />
        </div>
        {data.image_url && (
          <ImagePreview src={driveUrl(data.image_url)} label="Hero Image Preview" />
        )}
      </div>

      <div className="admin-section-card">
        <h3 className="admin-section-title">✍️ Hero Text</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Second Line (headline)</label>
            <input
              type="text"
              className="admin-input"
              value={data.second_line || ''}
              onChange={e => setData(d => ({ ...d, second_line: e.target.value }))}
              placeholder="Your Confidence."
            />
          </div>
          <div className="admin-form-group" style={{ flex: 2 }}>
            <label className="admin-label">Subtext</label>
            <input
              type="text"
              className="admin-input"
              value={data.subtext || ''}
              onChange={e => setData(d => ({ ...d, subtext: e.target.value }))}
              placeholder="Professional beauty services…"
            />
          </div>
        </div>
      </div>

      <div className="admin-section-card">
        <h3 className="admin-section-title">🔄 Rotating Words</h3>
        <p className="admin-section-hint">These words cycle in the hero headline (e.g. "Your <em>Glow</em>")</p>
        <div className="admin-tags">
          {data.rotating_words.map((w, i) => (
            <span key={i} className="admin-tag">
              {w}
              <button className="admin-tag__remove" onClick={() => removeWord(i)}>×</button>
            </span>
          ))}
        </div>
        <div className="admin-form-row admin-add-row">
          <input
            type="text"
            className="admin-input"
            placeholder="Add word…"
            value={wordInput}
            onChange={e => setWordInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWord())}
          />
          <button className="admin-btn admin-btn--secondary" onClick={addWord}>Add</button>
        </div>
      </div>

      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  );
}
