import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SaveBar, ConfirmDialog } from '../AdminComponents';

const EMPTY_PKG = {
  name: '',
  price: '',
  original_price: '',
  duration: '',
  description: '',
  features: [],
  popular: false,
  price_note: '',
  savings_label: '',
  sort_order: 0,
};

export default function PackagesEditor() {
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => { loadPackages(); }, []);

  async function loadPackages() {
    const { data } = await supabase.from('packages').select('*').order('sort_order');
    setPackages(data || []);
    setLoading(false);
  }

  async function savePackage() {
    if (!editing?.name || !editing?.price) return;
    setSaving(true);
    const payload = {
      name: editing.name,
      price: Number(editing.price),
      original_price: editing.original_price ? Number(editing.original_price) : null,
      duration: editing.duration,
      description: editing.description,
      features: editing.features || [],
      popular: editing.popular || false,
      price_note: editing.price_note || '',
      savings_label: editing.savings_label || '',
      sort_order: editing.sort_order || packages.length,
      updated_at: new Date().toISOString(),
    };
    if (editing.id) {
      await supabase.from('packages').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('packages').insert(payload);
    }
    await loadPackages();
    setEditing(null);
    setSaving(false);
  }

  async function deletePackage(id) {
    await supabase.from('packages').delete().eq('id', id);
    setDeleting(null);
    await loadPackages();
  }

  function addFeature() {
    if (featureInput.trim()) {
      setEditing(e => ({ ...e, features: [...(e.features || []), featureInput.trim()] }));
      setFeatureInput('');
    }
  }

  function removeFeature(i) {
    setEditing(e => ({ ...e, features: e.features.filter((_, idx) => idx !== i) }));
  }

  if (loading) return <div className="admin-tab-loading">Loading packages…</div>;

  if (editing) {
    return (
      <div className="admin-tab">
        <div className="admin-editor-header">
          <button className="admin-btn admin-btn--ghost" onClick={() => setEditing(null)}>← Back</button>
          <h3>{editing.id ? 'Edit Package' : 'New Package'}</h3>
        </div>

        <div className="admin-section-card">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Package Name *</label>
              <input className="admin-input" value={editing.name} onChange={e => setEditing(d => ({ ...d, name: e.target.value }))} placeholder="GLOW, SIGNATURE…" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Duration</label>
              <input className="admin-input" value={editing.duration || ''} onChange={e => setEditing(d => ({ ...d, duration: e.target.value }))} placeholder="2 hrs" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Price (₹) *</label>
              <input className="admin-input" type="number" value={editing.price} onChange={e => setEditing(d => ({ ...d, price: e.target.value }))} placeholder="1999" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Original Price (₹) — for strikethrough</label>
              <input className="admin-input" type="number" value={editing.original_price || ''} onChange={e => setEditing(d => ({ ...d, original_price: e.target.value }))} placeholder="2500" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Price Note</label>
              <input className="admin-input" value={editing.price_note || ''} onChange={e => setEditing(d => ({ ...d, price_note: e.target.value }))} placeholder="Starting price" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Savings Label</label>
              <input className="admin-input" value={editing.savings_label || ''} onChange={e => setEditing(d => ({ ...d, savings_label: e.target.value }))} placeholder="Save ₹500" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Sort Order</label>
              <input className="admin-input" type="number" value={editing.sort_order || 0} onChange={e => setEditing(d => ({ ...d, sort_order: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea className="admin-input admin-textarea" rows={3} value={editing.description || ''} onChange={e => setEditing(d => ({ ...d, description: e.target.value }))} placeholder="Package description…" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">
              <input type="checkbox" checked={editing.popular || false} onChange={e => setEditing(d => ({ ...d, popular: e.target.checked }))} style={{ marginRight: 8 }} />
              Most Popular
            </label>
          </div>
        </div>

        <div className="admin-section-card">
          <h3 className="admin-section-title">Included Services / Features</h3>
          <div className="admin-tags">
            {(editing.features || []).map((f, i) => (
              <span key={i} className="admin-tag">
                {f} <button className="admin-tag__remove" onClick={() => removeFeature(i)}>×</button>
              </span>
            ))}
          </div>
          <div className="admin-form-row admin-add-row">
            <input className="admin-input" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Add feature…" />
            <button className="admin-btn admin-btn--secondary" onClick={addFeature}>Add</button>
          </div>
        </div>

        <SaveBar onSave={savePackage} saving={saving} label={editing.id ? 'Save Changes' : 'Create Package'} />
      </div>
    );
  }

  return (
    <div className="admin-tab">
      <div className="admin-list-header">
        <span className="admin-count">{packages.length} packages</span>
        <button className="admin-btn admin-btn--primary" onClick={() => { setEditing({ ...EMPTY_PKG }); setFeatureInput(''); }} id="add-package-btn">
          + Add Package
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty__icon">📦</div>
          <p>No packages yet. Create your first package!</p>
        </div>
      ) : (
        <div className="admin-list">
          {packages.map(p => (
            <div key={p.id} className="admin-list-item">
              <div className="admin-list-item__icon">📦</div>
              <div className="admin-list-item__info">
                <div className="admin-list-item__name">
                  {p.name}
                  {p.popular && <span className="admin-badge admin-badge--gold">Popular</span>}
                </div>
                <div className="admin-list-item__meta">₹{p.price} · {p.duration} · {(p.features || []).length} features</div>
              </div>
              <div className="admin-list-item__actions">
                <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => { setEditing(p); setFeatureInput(''); }}>Edit</button>
                <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleting(p)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete "${deleting.name}"?`}
          message="This action cannot be undone."
          onConfirm={() => deletePackage(deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
