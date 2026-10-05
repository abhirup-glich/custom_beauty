// Shared reusable UI components for the admin panel

import { useState, useEffect } from 'react';

export function ImagePreview({ src, label, small = false }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [attemptedFallback, setAttemptedFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
    setAttemptedFallback(false);
    setLoading(true);
  }, [src]);

  function handleError() {
    // If it's a Google lh3 URL, try Google Drive thumbnail fallback
    if (!attemptedFallback && currentSrc && currentSrc.includes('lh3.googleusercontent.com/d/')) {
      const match = currentSrc.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        setAttemptedFallback(true);
        setCurrentSrc(`https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`);
        return;
      }
    }
    setLoading(false);
    setFailed(true);
  }

  function handleLoad() {
    setLoading(false);
    setFailed(false);
  }

  if (!src) return null;

  return (
    <div className={`admin-image-preview ${small ? 'admin-image-preview--small' : ''}`}>
      <div className="admin-image-preview__header">
        <span className="admin-image-preview__label">{label || 'Image Preview'}</span>
        {!failed && !loading && (
          <span className="admin-image-preview__badge">✓ Active</span>
        )}
      </div>

      <div className="admin-image-preview__wrapper">
        {loading && !failed && (
          <div className="admin-image-preview__loading">
            <span className="admin-btn__spinner" style={{ width: 18, height: 18 }} />
            <span>Loading preview…</span>
          </div>
        )}

        <img
          src={currentSrc}
          alt={label || 'Preview'}
          onError={handleError}
          onLoad={handleLoad}
          style={{ display: failed ? 'none' : 'block' }}
        />

        {failed && (
          <div className="admin-image-preview__error">
            <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠️</span> Image could not be loaded
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: '4px 0' }}>
              • If using <strong>Google Drive</strong>: Ensure Share permissions are set to <em>"Anyone with the link can view"</em>.<br />
              • If using <strong>public images</strong>: Place file in <code>public/images/</code> and enter <code>/images/filename.jpg</code>.
            </p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-image-preview__test-link"
            >
              Test link in new tab ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function SaveBar({ onSave, saving, saved, label = 'Save Changes' }) {
  return (
    <div className="admin-save-bar">
      {saved && <span className="admin-save-bar__success">✓ Saved successfully!</span>}
      <button
        className="admin-btn admin-btn--primary admin-btn--lg"
        onClick={onSave}
        disabled={saving}
        id="admin-save-btn"
      >
        {saving ? <><span className="admin-btn__spinner" /> Saving…</> : label}
      </button>
    </div>
  );
}

export function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="admin-confirm-overlay">
      <div className="admin-confirm-card">
        <div className="admin-confirm-icon">⚠️</div>
        <h3 className="admin-confirm-title">{title}</h3>
        <p className="admin-confirm-message">{message}</p>
        <div className="admin-confirm-actions">
          <button className="admin-btn admin-btn--ghost" onClick={onCancel}>Cancel</button>
          <button className="admin-btn admin-btn--danger" onClick={onConfirm} id="admin-confirm-delete-btn">Delete</button>
        </div>
      </div>
    </div>
  );
}

