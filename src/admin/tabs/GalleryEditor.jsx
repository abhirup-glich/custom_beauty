import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { driveUrl } from '../../lib/salonData';
import { ConfirmDialog, ImagePreview } from '../AdminComponents';

const CATEGORIES = ['Hair', 'Skin', 'Nails', 'Makeup', 'Bridal', 'Spa', 'Salon', 'General'];

const EMPTY_IMAGE = { src: '', alt: '', category: 'General', sort_order: 0 };

export default function GalleryEditor() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newImage, setNewImage] = useState({ ...EMPTY_IMAGE });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saved, setSaved] = useState('');

  useEffect(() => { loadImages(); }, []);

  async function loadImages() {
    const { data } = await supabase.from('gallery').select('*').order('sort_order');
    setImages(data || []);
    setLoading(false);
  }

  async function addImage() {
    if (!newImage.src) return;
    setSaving(true);
    await supabase.from('gallery').insert({
      src: newImage.src,
      alt: newImage.alt,
      category: newImage.category,
      sort_order: newImage.sort_order || images.length,
    });
    await loadImages();
    setNewImage({ ...EMPTY_IMAGE });
    setAdding(false);
    setSaving(false);
    setSaved('Image added!');
    setTimeout(() => setSaved(''), 2500);
  }

  async function deleteImage(id) {
    await supabase.from('gallery').delete().eq('id', id);
    setDeleting(null);
    await loadImages();
  }

  async function updateAlt(id, alt) {
    await supabase.from('gallery').update({ alt }).eq('id', id);
    setImages(imgs => imgs.map(i => i.id === id ? { ...i, alt } : i));
  }

  if (loading) return <div className="admin-tab-loading">Loading gallery…</div>;

  return (
    <div className="admin-tab">
      <div className="admin-list-header">
        <span className="admin-count">{images.length} images</span>
        <button className="admin-btn admin-btn--primary" onClick={() => setAdding(a => !a)} id="add-gallery-btn">
          {adding ? '× Cancel' : '+ Add Image'}
        </button>
      </div>

      {saved && <div className="admin-toast">{saved}</div>}

      {/* Add form */}
      {adding && (
        <div className="admin-section-card admin-add-gallery-form">
          <h3 className="admin-section-title">Add New Image</h3>
          <p className="admin-section-hint">Paste Google Drive link, public image URL, or local path (e.g. /images/service-hair.jpg)</p>
          <div className="admin-form-group">
            <label className="admin-label">Image URL / Path *</label>
            <input
              type="text"
              className="admin-input"
              value={newImage.src}
              onChange={e => setNewImage(i => ({ ...i, src: e.target.value }))}
              placeholder="https://drive.google.com/... or /images/your-photo.jpg"
              autoFocus
            />
          </div>
          {newImage.src && (
            <ImagePreview src={driveUrl(newImage.src)} label="Gallery Image Preview" />
          )}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Alt Text / Caption</label>
              <input className="admin-input" value={newImage.alt} onChange={e => setNewImage(i => ({ ...i, alt: e.target.value }))} placeholder="Luxury hair styling" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Category</label>
              <select className="admin-input admin-select" value={newImage.category} onChange={e => setNewImage(i => ({ ...i, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Sort Order</label>
              <input className="admin-input" type="number" value={newImage.sort_order} onChange={e => setNewImage(i => ({ ...i, sort_order: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="admin-form-row" style={{ justifyContent: 'flex-end', gap: 12 }}>
            <button className="admin-btn admin-btn--ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="admin-btn admin-btn--primary" onClick={addImage} disabled={saving || !newImage.src}>
              {saving ? 'Adding…' : 'Add to Gallery'}
            </button>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {images.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty__icon">🎨</div>
          <p>No gallery images yet. Add your first image!</p>
        </div>
      ) : (
        <div className="admin-gallery-grid">
          {images.map(img => (
            <div key={img.id} className="admin-gallery-item">
              <img
                src={driveUrl(img.src)}
                alt={img.alt}
                loading="lazy"
                onError={e => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0e8e0" width="200" height="200"/%3E%3Ctext y="110" x="50%25" text-anchor="middle" fill="%23b88782" font-size="40"%3E🖼%3C/text%3E%3C/svg%3E'; }}
              />
              <div className="admin-gallery-item__overlay">
                <span className="admin-gallery-item__cat">{img.category}</span>
                <button
                  className="admin-gallery-item__delete"
                  onClick={() => setDeleting(img)}
                  title="Delete image"
                >
                  ✕
                </button>
              </div>
              <input
                className="admin-gallery-item__alt-input"
                value={img.alt || ''}
                onChange={e => setImages(imgs => imgs.map(i => i.id === img.id ? { ...i, alt: e.target.value } : i))}
                onBlur={e => updateAlt(img.id, e.target.value)}
                placeholder="Alt text…"
              />
            </div>
          ))}
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this image?"
          message={`"${deleting.alt || deleting.src}" will be removed from the gallery.`}
          onConfirm={() => deleteImage(deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
