import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { driveUrl } from '../../lib/salonData';
import { ImagePreview, SaveBar, ConfirmDialog } from '../AdminComponents';

const EMPTY_SERVICE = {
  category: 'Hair',
  name: '',
  price: '',
  duration: '',
  description: '',
  benefits: [],
  popular: false,
  image_url: '',
  sort_order: 0,
};

const CATEGORIES = ['Hair', 'Skin', 'Nails', 'Makeup', 'Spa', 'Bridal', 'Other'];

export default function ServicesEditor() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | service obj
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [benefitInput, setBenefitInput] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setServices(data || []);
    setLoading(false);
  }

  async function saveService() {
    if (!editing?.name || !editing?.price) return;
    setSaving(true);
    const payload = {
      category: editing.category,
      name: editing.name,
      price: Number(editing.price),
      duration: editing.duration,
      description: editing.description,
      benefits: editing.benefits || [],
      popular: editing.popular || false,
      image_url: editing.image_url || '',
      sort_order: editing.sort_order || services.length,
      updated_at: new Date().toISOString(),
    };
    if (editing.id) {
      await supabase.from('services').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('services').insert(payload);
    }
    await loadServices();
    setEditing(null);
    setSaving(false);
  }

  async function deleteService(id) {
    await supabase.from('services').delete().eq('id', id);
    setDeleting(null);
    await loadServices();
  }

  function addBenefit() {
    if (benefitInput.trim()) {
      setEditing(e => ({ ...e, benefits: [...(e.benefits || []), benefitInput.trim()] }));
      setBenefitInput('');
    }
  }

  function removeBenefit(i) {
    setEditing(e => ({ ...e, benefits: e.benefits.filter((_, idx) => idx !== i) }));
  }

  if (loading) return <div className="admin-tab-loading">Loading services…</div>;

  if (editing) {
    return (
      <div className="admin-tab">
        <div className="admin-editor-header">
          <button className="admin-btn admin-btn--ghost" onClick={() => setEditing(null)}>← Back</button>
          <h3>{editing.id ? 'Edit Service' : 'New Service'}</h3>
        </div>

        <div className="admin-section-card">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Service Name *</label>
              <input className="admin-input" value={editing.name} onChange={e => setEditing(d => ({ ...d, name: e.target.value }))} placeholder="Precision Haircut" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Category</label>
              <select className="admin-input admin-select" value={editing.category} onChange={e => setEditing(d => ({ ...d, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Price (₹) *</label>
              <input className="admin-input" type="number" value={editing.price} onChange={e => setEditing(d => ({ ...d, price: e.target.value }))} placeholder="799" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Duration</label>
              <input className="admin-input" value={editing.duration || ''} onChange={e => setEditing(d => ({ ...d, duration: e.target.value }))} placeholder="45 min" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Sort Order</label>
              <input className="admin-input" type="number" value={editing.sort_order || 0} onChange={e => setEditing(d => ({ ...d, sort_order: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea className="admin-input admin-textarea" value={editing.description || ''} onChange={e => setEditing(d => ({ ...d, description: e.target.value }))} placeholder="Brief service description…" rows={3} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Image URL or Local Path</label>
            <input className="admin-input" type="text" value={editing.image_url || ''} onChange={e => setEditing(d => ({ ...d, image_url: e.target.value }))} placeholder="https://drive.google.com/... or /images/service-hair.jpg" />
          </div>
          {editing.image_url && <ImagePreview src={driveUrl(editing.image_url)} label="Service Image" />}
          <div className="admin-form-group">
            <label className="admin-label">
              <input type="checkbox" checked={editing.popular || false} onChange={e => setEditing(d => ({ ...d, popular: e.target.checked }))} style={{ marginRight: 8 }} />
              Mark as Popular
            </label>
          </div>
        </div>

        <div className="admin-section-card">
          <h3 className="admin-section-title">Benefits / Inclusions</h3>
          <div className="admin-tags">
            {(editing.benefits || []).map((b, i) => (
              <span key={i} className="admin-tag">
                {b} <button className="admin-tag__remove" onClick={() => removeBenefit(i)}>×</button>
              </span>
            ))}
          </div>
          <div className="admin-form-row admin-add-row">
            <input className="admin-input" value={benefitInput} onChange={e => setBenefitInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())} placeholder="Add benefit…" />
            <button className="admin-btn admin-btn--secondary" onClick={addBenefit}>Add</button>
          </div>
        </div>

        <SaveBar onSave={saveService} saving={saving} label={editing.id ? 'Save Changes' : 'Create Service'} />
      </div>
    );
  }

  return (
    <div className="admin-tab">
      <div className="admin-list-header">
        <span className="admin-count">{services.length} services</span>
        <button className="admin-btn admin-btn--primary" onClick={() => setEditing({ ...EMPTY_SERVICE })} id="add-service-btn">
          + Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty__icon">💅</div>
          <p>No services yet. Add your first service!</p>
        </div>
      ) : (
        <div className="admin-list">
          {services.map(s => (
            <div key={s.id} className="admin-list-item">
              <div className="admin-list-item__image">
                {s.image_url ? <img src={driveUrl(s.image_url)} alt={s.name} /> : <span>💅</span>}
              </div>
              <div className="admin-list-item__info">
                <div className="admin-list-item__name">
                  {s.name}
                  {s.popular && <span className="admin-badge admin-badge--gold">Popular</span>}
                </div>
                <div className="admin-list-item__meta">{s.category} · ₹{s.price} · {s.duration}</div>
              </div>
              <div className="admin-list-item__actions">
                <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => { setEditing(s); setBenefitInput(''); }}>Edit</button>
                <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleting(s)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete "${deleting.name}"?`}
          message="This action cannot be undone."
          onConfirm={() => deleteService(deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
