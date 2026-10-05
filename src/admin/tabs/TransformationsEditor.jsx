import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSalonData, driveUrl } from '../../lib/salonData';
import { ImagePreview, SaveBar, ConfirmDialog } from '../AdminComponents';

const IMAGE_PRESETS = [
  { label: 'Hair Care', url: '/images/service-hair.jpg' },
  { label: 'Hair Artist', url: '/images/team-aarohi.jpg' },
  { label: 'Facial', url: '/images/service-facial.jpg' },
  { label: 'Bridal', url: '/images/service-bridal.jpg' },
  { label: 'Nails', url: '/images/service-nails.jpg' },
  { label: 'Spa Treatment', url: '/images/service-spa.jpg' },
  { label: 'Skin Therapist', url: '/images/team-priya.jpg' }
];

const CATEGORIES = ['Hair', 'Skin', 'Makeup', 'Nails', 'Bridal', 'Results'];

const EMPTY_TRANSFORMATION = {
  label: '',
  category: 'Hair',
  before: '/images/service-hair.jpg',
  after: '/images/team-aarohi.jpg'
};

export default function TransformationsEditor() {
  const { salonData, updateSalonData } = useSalonData();
  const [items, setItems] = useState(() => {
    return salonData?.transformations && salonData.transformations.length > 0
      ? JSON.parse(JSON.stringify(salonData.transformations))
      : [
          {
            id: 't-0',
            category: 'Hair',
            label: 'Balayage Transformation',
            before: '/images/service-hair.jpg',
            after: '/images/team-aarohi.jpg'
          },
          {
            id: 't-1',
            category: 'Makeup',
            label: 'Glam Makeover',
            before: '/images/service-facial.jpg',
            after: '/images/service-bridal.jpg'
          },
          {
            id: 't-2',
            category: 'Bridal',
            label: 'Bridal Look',
            before: '/images/team-priya.jpg',
            after: '/images/service-bridal.jpg'
          },
          {
            id: 't-3',
            category: 'Skin',
            label: 'Glow Treatment',
            before: '/images/service-spa.jpg',
            after: '/images/service-facial.jpg'
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
    setEditForm({ ...EMPTY_TRANSFORMATION, id: `t-${Date.now()}` });
  }

  function startEdit(idx) {
    setEditingIndex(idx);
    setEditForm({ ...items[idx] });
  }

  function handleSaveModal() {
    if (!editForm.label.trim()) {
      alert('Please enter a title or label for this transformation.');
      return;
    }
    if (!editForm.before || !editForm.after) {
      alert('Please provide both Before and After image links.');
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

  function handleImageUpload(field, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm(f => ({ ...f, [field]: event.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveAll() {
    setSaving(true);
    // 1. Update React state + localStorage
    updateSalonData({ transformations: items });

    // 2. Try saving to Supabase if configured
    if (supabase) {
      try {
        const records = items.map((t, i) => ({
          label: t.label,
          category: t.category,
          before: t.before,
          after: t.after,
          sort_order: i,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('transformations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('transformations').insert(records);
      } catch (err) {
        console.warn('Supabase transformations save skipped/failed, saved to local storage:', err);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  return (
    <div className="admin-tab">
      <div className="admin-super-banner" style={{ background: 'rgba(212,168,67,0.12)', borderColor: 'rgba(212,168,67,0.3)', color: 'var(--adm-text)' }}>
        ✨ <strong>Before & After Transformations</strong> — Show off dramatic client makeovers with interactive sliding comparisons!
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--adm-text)', margin: 0 }}>Transformation Sliders ({items.length})</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-2)', margin: '4px 0 0 0' }}>
            Visitors can drag the slider left and right to compare Before vs After.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={startAdd}
          id="admin-add-trans-btn"
        >
          + Add Transformation
        </button>
      </div>

      {/* Grid of transformations */}
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
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(184,135,130,0.2)', color: 'var(--adm-accent)', fontWeight: 600 }}>
                {item.category}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-3)' }}>#{idx + 1}</span>
            </div>

            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--adm-text)' }}>{item.label}</h4>

            {/* Before vs After thumbnails side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--adm-text-3)', display: 'block', marginBottom: 4 }}>
                  BEFORE
                </span>
                <img
                  src={driveUrl(item.before)}
                  alt="Before"
                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--adm-border)' }}
                  onError={(e) => { e.currentTarget.src = '/images/service-hair.jpg'; }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--adm-accent)', display: 'block', marginBottom: 4 }}>
                  AFTER
                </span>
                <img
                  src={driveUrl(item.after)}
                  alt="After"
                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--adm-accent)' }}
                  onError={(e) => { e.currentTarget.src = '/images/team-aarohi.jpg'; }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--adm-border)' }}>
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
          <div className="admin-confirm-card" style={{ maxWidth: '540px', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="admin-confirm-title" style={{ marginBottom: '14px' }}>
              {editingIndex === 'new' ? '✨ Add Transformation' : `✏️ Edit ${editForm.label || 'Transformation'}`}
            </h3>

            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 2 }}>
                <label className="admin-label">Transformation Title / Label *</label>
                <input
                  className="admin-input"
                  value={editForm.label}
                  onChange={(e) => setEditForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Balayage Transformation"
                />
              </div>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label className="admin-label">Category</label>
                <select
                  className="admin-input"
                  value={editForm.category}
                  onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Before Photo */}
            <div className="admin-form-group">
              <label className="admin-label">📷 BEFORE Photo (Link, Preset, or Upload)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="admin-input"
                  value={editForm.before}
                  onChange={(e) => setEditForm(f => ({ ...f, before: e.target.value }))}
                  placeholder="https://... or /images/..."
                  style={{ flex: 1 }}
                />
                <label className="admin-btn admin-btn--secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 12px' }}>
                  📁 Upload
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload('before', e)} />
                </label>
              </div>
              {editForm.before && (
                <div style={{ marginTop: '8px' }}>
                  <ImagePreview src={driveUrl(editForm.before)} label="Before Photo Preview" small />
                </div>
              )}
            </div>

            {/* After Photo */}
            <div className="admin-form-group">
              <label className="admin-label">✨ AFTER Photo (Link, Preset, or Upload)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="admin-input"
                  value={editForm.after}
                  onChange={(e) => setEditForm(f => ({ ...f, after: e.target.value }))}
                  placeholder="https://... or /images/..."
                  style={{ flex: 1 }}
                />
                <label className="admin-btn admin-btn--secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 12px' }}>
                  📁 Upload
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload('after', e)} />
                </label>
              </div>
              {editForm.after && (
                <div style={{ marginTop: '8px' }}>
                  <ImagePreview src={driveUrl(editForm.after)} label="After Photo Preview" small />
                </div>
              )}
            </div>

            {/* Presets */}
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-3)', display: 'block', marginBottom: '4px' }}>
                Quick Stock Presets:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {IMAGE_PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                    onClick={() => {
                      if (!editForm.before) setEditForm(f => ({ ...f, before: p.url }));
                      else setEditForm(f => ({ ...f, after: p.url }));
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
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
          title="Delete Transformation?"
          message={`Are you sure you want to remove "${items[confirmDeleteIdx]?.label}"?`}
          onConfirm={() => handleDelete(confirmDeleteIdx)}
          onCancel={() => setConfirmDeleteIdx(null)}
        />
      )}

      <SaveBar onSave={handleSaveAll} saving={saving} saved={saved} label="Save Transformations" />
    </div>
  );
}
