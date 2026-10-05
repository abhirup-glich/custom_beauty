import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSalonData, driveUrl } from '../../lib/salonData';
import { ImagePreview, SaveBar, ConfirmDialog } from '../AdminComponents';

const AVATAR_PRESETS = [
  { label: 'Aarohi (Hair)', url: '/images/team-aarohi.jpg' },
  { label: 'Priya (Skin)', url: '/images/team-priya.jpg' },
  { label: 'Bridal (Specialist)', url: '/images/service-bridal.jpg' },
  { label: 'Nails (Artist)', url: '/images/service-nails.jpg' },
  { label: 'Spa (Therapist)', url: '/images/service-spa.jpg' },
  { label: 'Facial (Stylist)', url: '/images/service-facial.jpg' }
];

const EMPTY_MEMBER = {
  name: '',
  role: 'Stylist & Specialist',
  specialization: 'Hair · Skin · Care',
  experience: '5+ years',
  bio: '',
  image: '/images/team-aarohi.jpg'
};

export default function TeamEditor() {
  const { salonData, updateSalonData } = useSalonData();
  const [team, setTeam] = useState(() => {
    return salonData?.team && salonData.team.length > 0
      ? JSON.parse(JSON.stringify(salonData.team))
      : [
          {
            id: 'm-1',
            name: 'Aarohi Sharma',
            role: 'Senior Hair Artist',
            specialization: 'Hair Color · Styling · Bridal',
            experience: '8 years',
            image: '/images/team-aarohi.jpg',
            bio: 'Aarohi brings a creative eye and technical precision to every look. Known for transformative color work.'
          },
          {
            id: 'm-2',
            name: 'Priya Menon',
            role: 'Lead Skin Therapist',
            specialization: 'Facials · Chemical Peels · Skin Analysis',
            experience: '6 years',
            image: '/images/team-priya.jpg',
            bio: 'Priya combines science and intuition to craft personalized skincare journeys.'
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
    setEditForm({ ...EMPTY_MEMBER, id: `member-${Date.now()}` });
  }

  function startEdit(idx) {
    setEditingIndex(idx);
    setEditForm({ ...team[idx] });
  }

  function handleSaveModal() {
    if (!editForm.name.trim()) {
      alert('Please enter a name for the specialist.');
      return;
    }

    if (editingIndex === 'new') {
      setTeam(prev => [...prev, editForm]);
    } else {
      setTeam(prev => prev.map((m, i) => (i === editingIndex ? editForm : m)));
    }
    setEditingIndex(null);
    setEditForm(null);
  }

  function handleDelete(idx) {
    setTeam(prev => prev.filter((_, i) => i !== idx));
    setConfirmDeleteIdx(null);
  }

  function handleMove(idx, direction) {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= team.length) return;
    const copy = [...team];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setTeam(copy);
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm(f => ({ ...f, image: event.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveAll() {
    setSaving(true);
    // 1. Update React state + localStorage
    updateSalonData({ team });

    // 2. Try saving to Supabase if configured
    if (supabase) {
      try {
        // Upsert team members
        const records = team.map((m, i) => ({
          name: m.name,
          role: m.role,
          specialization: m.specialization,
          experience: m.experience,
          bio: m.bio,
          image: m.image,
          sort_order: i,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('team').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('team').insert(records);
      } catch (err) {
        console.warn('Supabase team save skipped/failed, saved to local storage:', err);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  return (
    <div className="admin-tab">
      <div className="admin-super-banner" style={{ background: 'rgba(184,135,130,0.15)', borderColor: 'rgba(184,135,130,0.3)', color: 'var(--adm-text)' }}>
        👥 <strong>Specialists & Team</strong> — Introduce your stylists and beauty experts. Clients can choose them when booking!
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--adm-text)', margin: 0 }}>Team Members ({team.length})</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-2)', margin: '4px 0 0 0' }}>
            Arrange the order your team appears on the website.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={startAdd}
          id="admin-add-team-btn"
        >
          + Add Specialist
        </button>
      </div>

      {/* Team Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {team.map((member, idx) => (
          <div
            key={member.id || idx}
            style={{
              background: 'var(--adm-surface)',
              border: '1px solid var(--adm-border)',
              borderRadius: 'var(--adm-radius)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <img
                src={driveUrl(member.image)}
                alt={member.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--adm-accent)'
                }}
                onError={(e) => { e.currentTarget.src = '/images/team-priya.jpg'; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--adm-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {member.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--adm-accent)', marginTop: 2 }}>{member.role}</div>
                {member.experience && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--adm-text-3)', marginTop: 2 }}>⭐ {member.experience}</div>
                )}
              </div>
            </div>

            {member.specialization && (
              <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-2)', background: 'var(--adm-surface-2)', padding: '6px 10px', borderRadius: '6px' }}>
                {member.specialization}
              </div>
            )}

            {member.bio && (
              <p style={{ fontSize: '0.76rem', color: 'var(--adm-text-3)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                {member.bio}
              </p>
            )}

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
                  disabled={idx === team.length - 1}
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
          <div className="admin-confirm-card" style={{ maxWidth: '520px', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="admin-confirm-title" style={{ marginBottom: '14px' }}>
              {editingIndex === 'new' ? '✨ Add New Specialist' : `✏️ Edit ${editForm.name || 'Specialist'}`}
            </h3>

            <div className="admin-form-group">
              <label className="admin-label">Full Name *</label>
              <input
                className="admin-input"
                value={editForm.name}
                onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Kavya Nair"
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label className="admin-label">Role / Title *</label>
                <input
                  className="admin-input"
                  value={editForm.role}
                  onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Senior Hair Artist"
                />
              </div>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label className="admin-label">Experience</label>
                <input
                  className="admin-input"
                  value={editForm.experience}
                  onChange={(e) => setEditForm(f => ({ ...f, experience: e.target.value }))}
                  placeholder="e.g. 7 years"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Specializations / Skills</label>
              <input
                className="admin-input"
                value={editForm.specialization}
                onChange={(e) => setEditForm(f => ({ ...f, specialization: e.target.value }))}
                placeholder="e.g. Bridal · Party · Editorial · Skin Care"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Short Bio / Story</label>
              <textarea
                className="admin-input admin-textarea"
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Brief intro for clients to know their expertise..."
              />
            </div>

            {/* Photo Selection */}
            <div className="admin-form-group">
              <label className="admin-label">Profile Photo (Link, Preset, or Upload)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="admin-input"
                  value={editForm.image}
                  onChange={(e) => setEditForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://... or /images/team-priya.jpg"
                  style={{ flex: 1 }}
                />
                <label className="admin-btn admin-btn--secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 12px' }}>
                  📁 Upload
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              </div>

              {/* Quick photo presets */}
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-3)', display: 'block', marginBottom: '4px' }}>
                  Quick Photo Presets:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {AVATAR_PRESETS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      className="admin-btn admin-btn--secondary"
                      style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                      onClick={() => setEditForm(f => ({ ...f, image: p.url }))}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {editForm.image && (
                <div style={{ marginTop: '10px' }}>
                  <ImagePreview src={driveUrl(editForm.image)} label="Avatar Preview" small />
                </div>
              )}
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
          title="Remove Specialist?"
          message={`Are you sure you want to remove ${team[confirmDeleteIdx]?.name}?`}
          onConfirm={() => handleDelete(confirmDeleteIdx)}
          onCancel={() => setConfirmDeleteIdx(null)}
        />
      )}

      <SaveBar onSave={handleSaveAll} saving={saving} saved={saved} label="Save Team Members" />
    </div>
  );
}
