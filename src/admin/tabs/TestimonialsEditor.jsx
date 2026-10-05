import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSalonData } from '../../lib/salonData';
import { SaveBar, ConfirmDialog } from '../AdminComponents';

const EMPTY_TESTIMONIAL = {
  name: '',
  role: 'Regular Client',
  rating: 5,
  text: ''
};

export default function TestimonialsEditor() {
  const { salonData, updateSalonData } = useSalonData();
  const [items, setItems] = useState(() => {
    return salonData?.testimonials && salonData.testimonials.length > 0
      ? JSON.parse(JSON.stringify(salonData.testimonials))
      : [
          {
            id: 'testi-1',
            name: 'Priya K.',
            role: 'Regular Client',
            rating: 5,
            text: 'Absolutely loved the experience. The team understood exactly what I wanted and delivered beyond my expectations. My skin has never looked better!'
          },
          {
            id: 'testi-2',
            name: 'Sneha R.',
            role: 'Bridal Client',
            rating: 5,
            text: 'Kavya did my bridal makeup and I was absolutely stunning. Every photo looks incredible. Worth every rupee!'
          },
          {
            id: 'testi-3',
            name: 'Meera T.',
            role: 'Regular Client',
            rating: 5,
            text: "I've been coming here for 2 years. The Signature Facial is my monthly ritual — it's the only place I trust with my skin."
          }
        ];
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function startAdd() {
    setEditingIndex('new');
    setEditForm({ ...EMPTY_TESTIMONIAL, id: `testi-${Date.now()}` });
  }

  function startEdit(idx) {
    setEditingIndex(idx);
    setEditForm({ ...items[idx] });
  }

  function handleSaveModal() {
    if (!editForm.name.trim()) {
      alert('Please enter client name.');
      return;
    }
    if (!editForm.text.trim()) {
      alert('Please enter the review text.');
      return;
    }

    if (editingIndex === 'new') {
      setItems(prev => [...prev, editForm]);
    } else {
      setItems(prev => prev.map((item, i) => (i === editingIndex ? editForm : item)));
    }
    setEditingIndex(null);
    setEditForm(null);
  }

  function handleDelete(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setConfirmDeleteIdx(null);
  }

  function handleMove(idx, direction) {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const copy = [...items];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setItems(copy);
  }

  async function handleSaveAll() {
    setSaving(true);
    // 1. Update React state + localStorage
    updateSalonData({ testimonials: items });

    // 2. Try saving to Supabase if configured
    if (supabase) {
      try {
        const records = items.map((t, i) => ({
          name: t.name,
          role: t.role,
          rating: Number(t.rating) || 5,
          text: t.text,
          sort_order: i,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('testimonials').insert(records);
      } catch (err) {
        console.warn('Supabase testimonials save skipped/failed, saved to local storage:', err);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  return (
    <div className="admin-tab">
      <div className="admin-super-banner" style={{ background: 'rgba(212,168,67,0.12)', borderColor: 'rgba(212,168,67,0.3)', color: 'var(--adm-text)' }}>
        💬 <strong>Client Stories & Testimonials</strong> — Highlight genuine client reviews and 5-star experiences to build trust!
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--adm-text)', margin: 0 }}>Client Reviews ({items.length})</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-2)', margin: '4px 0 0 0' }}>
            Featured in the animated testimonials carousel on your site.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={startAdd}
          id="admin-add-testi-btn"
        >
          + Add Review
        </button>
      </div>

      {/* Reviews Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            style={{
              background: 'var(--adm-surface)',
              border: '1px solid var(--adm-border)',
              borderRadius: 'var(--adm-radius)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#d4a843', fontSize: '1rem', letterSpacing: '2px' }}>
                {'★'.repeat(Math.round(item.rating || 5))}
                {'☆'.repeat(5 - Math.round(item.rating || 5))}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-3)' }}>#{idx + 1}</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--adm-text-2)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
              "{item.text}"
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '6px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--adm-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                {item.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--adm-text)' }}>{item.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-3)' }}>{item.role || 'Client'}</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                  onClick={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  title="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === items.length - 1}
                  title="Move right"
                >
                  →
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => startEdit(idx)}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setConfirmDeleteIdx(idx)}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingIndex !== null && editForm && (
        <div className="admin-confirm-overlay" style={{ zIndex: 1000 }}>
          <div className="admin-confirm-card" style={{ maxWidth: '480px', textAlign: 'left' }}>
            <h3 className="admin-confirm-title" style={{ marginBottom: '14px' }}>
              {editingIndex === 'new' ? '✨ Add Client Review' : `✏️ Edit Review by ${editForm.name || 'Client'}`}
            </h3>

            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label className="admin-label">Client Name *</label>
                <input
                  className="admin-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Priya K."
                />
              </div>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label className="admin-label">Tag / Role</label>
                <input
                  className="admin-input"
                  value={editForm.role}
                  onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Regular Client, Bride"
                />
              </div>
            </div>

            {/* Clickable Star Rating Picker */}
            <div className="admin-form-group">
              <label className="admin-label">Star Rating (1 to 5 Stars)</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f, rating: star }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.8rem',
                      cursor: 'pointer',
                      color: star <= editForm.rating ? '#d4a843' : 'var(--adm-surface-3)',
                      transition: 'transform 0.15s'
                    }}
                    title={`${star} Stars`}
                  >
                    ★
                  </button>
                ))}
                <span style={{ fontSize: '0.85rem', color: 'var(--adm-text-2)', marginLeft: '10px' }}>
                  {editForm.rating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Review / Testimonial Text *</label>
              <textarea
                className="admin-input admin-textarea"
                rows={4}
                value={editForm.text}
                onChange={(e) => setEditForm(f => ({ ...f, text: e.target.value }))}
                placeholder="What did the client say about their visit or service?..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => { setEditingIndex(null); setEditForm(null); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleSaveModal}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDeleteIdx !== null && (
        <ConfirmDialog
          title="Delete Review?"
          message={`Are you sure you want to remove the review by "${items[confirmDeleteIdx]?.name}"?`}
          onConfirm={() => handleDelete(confirmDeleteIdx)}
          onCancel={() => setConfirmDeleteIdx(null)}
        />
      )}

      <SaveBar onSave={handleSaveAll} saving={saving} saved={saved} label="Save Reviews" />
    </div>
  );
}
