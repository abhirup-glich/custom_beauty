import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useSalonData } from '../../lib/salonData';
import { createGoogleCalendarUrl, getGoogleCalendarEmbedUrl } from '../../lib/googleCalendar';
import salon, { formatPrice } from '../../salon';

export default function BookingsEditor({ isSuperAdmin }) {
  const { salonData } = useSalonData();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('list'); // 'list' | 'calendar'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_name: salonData?.services?.[0]?.name || 'Signature Facial',
    service_price: salonData?.services?.[0]?.price || 1499,
    duration: salonData?.services?.[0]?.duration || '60 min',
    professional_name: 'Any Available',
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: '11:00',
    notes: '',
    status: 'confirmed',
  });

  // Load bookings and site calendar settings
  useEffect(() => {
    fetchBookings();
    supabase.from('site_settings').select('google_calendar_id').eq('id', 'main').single()
      .then(({ data }) => {
        if (data?.google_calendar_id) {
          setCalendarId(data.google_calendar_id);
        } else if (salon.googleCalendarId) {
          setCalendarId(salon.googleCalendarId);
        }
      });
  }, []);

  async function fetchBookings() {
    setLoading(true);
    const { data, error } = await supabase.from('bookings').select('*').order('booking_date', { ascending: true });
    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  }

  async function handleStatusChange(bookingId, newStatus) {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  }

  async function handleDelete(bookingId) {
    if (!window.confirm('Are you sure you want to remove this appointment?')) return;
    await supabase.from('bookings').delete().eq('id', bookingId);
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  }

  async function saveCalendarId() {
    await supabase.from('site_settings').update({ google_calendar_id: calendarId.trim() }).eq('id', 'main');
    setCalendarSaved(true);
    setTimeout(() => setCalendarSaved(false), 2500);
  }

  async function handleCreateBooking(e) {
    e.preventDefault();
    const created = {
      ...newBooking,
      service_price: Number(newBooking.service_price) || 0,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('bookings').insert(created);
    if (!error) {
      fetchBookings();
      setShowAddModal(false);
      // Reset form
      setNewBooking({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        service_name: salonData?.services?.[0]?.name || 'Signature Facial',
        service_price: salonData?.services?.[0]?.price || 1499,
        duration: salonData?.services?.[0]?.duration || '60 min',
        professional_name: 'Any Available',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '11:00',
        notes: '',
        status: 'confirmed',
      });
    }
  }

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        (b.customer_name && b.customer_name.toLowerCase().includes(q)) ||
        (b.customer_phone && b.customer_phone.includes(q)) ||
        (b.service_name && b.service_name.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Quick metrics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const today = bookings.filter(b => b.booking_date === todayStr).length;
    return { total, confirmed, pending, today };
  }, [bookings]);

  // Helper for Google Calendar link
  const getGCalLink = (b) => {
    const durationNum = parseInt(String(b.duration || '60').replace(/\D/g, ''), 10) || 60;
    return createGoogleCalendarUrl({
      title: `${b.service_name || 'Appointment'} — ${b.customer_name || 'Client'}`,
      description: `Client: ${b.customer_name}\nPhone: ${b.customer_phone}\nEmail: ${b.customer_email || 'N/A'}\nService: ${b.service_name} (₹${b.service_price})\nProfessional: ${b.professional_name || 'Any'}\nNotes: ${b.notes || 'None'}\n\nSalon: ${salonData.name || salon.name}\nAddress: ${salonData.address?.full || salon.address.full}`,
      location: salonData.address?.full || salon.address.full,
      startDate: b.booking_date,
      startTime: b.booking_time || '10:00',
      durationMinutes: durationNum,
    });
  };

  const getWhatsAppLink = (b) => {
    const phone = (b.customer_phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(`Hi ${b.customer_name}! This is ${salonData.name || salon.name} regarding your appointment for ${b.service_name} on ${b.booking_date} at ${b.booking_time}.`);
    return `https://wa.me/${phone}?text=${text}`;
  };

  const embedUrl = getGoogleCalendarEmbedUrl(calendarId, 'MONTH', salon.timezone);

  return (
    <div className="admin-tab">
      {/* Top Banner */}
      <div className="admin-super-banner" style={{ background: 'rgba(66,133,244,0.12)', borderColor: 'rgba(66,133,244,0.25)', color: '#8ab4f8' }}>
        <span>📅 Appointments & Google Calendar Management — Sync and manage all client appointments seamlessly</span>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-section-card" style={{ padding: '1rem 1.25rem', marginBottom: 0 }}>
          <div style={{ color: 'var(--adm-text-3)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Bookings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{stats.total}</div>
        </div>
        <div className="admin-section-card" style={{ padding: '1rem 1.25rem', marginBottom: 0 }}>
          <div style={{ color: 'var(--adm-success)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Confirmed</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--adm-success)', marginTop: '4px' }}>{stats.confirmed}</div>
        </div>
        <div className="admin-section-card" style={{ padding: '1rem 1.25rem', marginBottom: 0 }}>
          <div style={{ color: 'var(--adm-gold)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending Confirmation</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--adm-gold)', marginTop: '4px' }}>{stats.pending}</div>
        </div>
        <div className="admin-section-card" style={{ padding: '1rem 1.25rem', marginBottom: 0 }}>
          <div style={{ color: '#8ab4f8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Today's Schedule</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8ab4f8', marginTop: '4px' }}>{stats.today}</div>
        </div>
      </div>

      {/* View Switcher & Action Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', border: '1px solid var(--adm-border)' }}>
          <button
            type="button"
            className="admin-btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              background: activeView === 'list' ? 'var(--adm-accent)' : 'transparent',
              color: activeView === 'list' ? '#fff' : 'var(--adm-text-2)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setActiveView('list')}
            id="view-bookings-list-btn"
          >
            📋 Appointments List ({filteredBookings.length})
          </button>
          <button
            type="button"
            className="admin-btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              background: activeView === 'calendar' ? '#1a73e8' : 'transparent',
              color: activeView === 'calendar' ? '#fff' : 'var(--adm-text-2)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setActiveView('calendar')}
            id="view-bookings-calendar-btn"
          >
            📅 Google Calendar View
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            style={{ background: 'linear-gradient(135deg, #1a73e8, #4285f4)', color: '#fff' }}
            onClick={() => setShowAddModal(true)}
            id="admin-add-booking-btn"
          >
            + New Appointment
          </button>
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Open Google Calendar ↗
          </a>
        </div>
      </div>

      {/* VIEW: APPOINTMENTS LIST */}
      {activeView === 'list' && (
        <div className="admin-section-card">
          {/* Filters & Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--adm-border)' }}>
            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: statusFilter === st ? 'rgba(255,255,255,0.15)' : 'transparent',
                    borderColor: statusFilter === st ? 'var(--adm-text)' : 'var(--adm-border)',
                    color: statusFilter === st ? '#fff' : 'var(--adm-text-2)',
                  }}
                  id={`filter-status-${st}`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              className="admin-input"
              style={{ maxWidth: '280px', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
              placeholder="🔍 Search client, phone, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-bookings-input"
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--adm-text-2)' }}>
              Loading appointments…
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--adm-text-2)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
              <h4 style={{ color: '#fff', marginBottom: '4px' }}>No appointments found</h4>
              <p style={{ fontSize: '0.82rem', opacity: 0.7 }}>
                {searchQuery || statusFilter !== 'all' ? 'Try changing your search or filter.' : 'Appointments booked by customers will show up here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredBookings.map(b => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '10px',
                    padding: '1rem',
                    gap: '1rem',
                  }}
                  id={`booking-card-${b.id}`}
                >
                  {/* Left: Date & Time Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '160px' }}>
                    <div style={{
                      background: 'rgba(212,168,67,0.12)',
                      border: '1px solid rgba(212,168,67,0.3)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-US', { month: 'short' }) : 'DATE'}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                        {b.booking_date ? new Date(b.booking_date).getDate() : '--'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px', fontWeight: 500 }}>
                        {b.booking_time || '10:00'}
                      </div>
                    </div>

                    {/* Service & Client details */}
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                        {b.service_name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--adm-accent)', marginTop: '2px' }}>
                        ₹{b.service_price} {b.duration && `· ${b.duration}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: '4px' }}>
                        👤 <strong>{b.customer_name}</strong> · <a href={`tel:${b.customer_phone}`} style={{ color: 'var(--adm-text-2)', textDecoration: 'none' }}>{b.customer_phone}</a>
                      </div>
                      {b.professional_name && b.professional_name !== 'Any Available' && (
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                          Specialist: {b.professional_name}
                        </div>
                      )}
                      {b.notes && (
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', fontStyle: 'italic' }}>
                          Note: "{b.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Status Dropdown */}
                    <select
                      className="admin-input"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        width: 'auto',
                        background:
                          b.status === 'confirmed' ? 'rgba(74,222,128,0.15)' :
                          b.status === 'pending' ? 'rgba(212,168,67,0.15)' :
                          b.status === 'completed' ? 'rgba(66,133,244,0.15)' : 'rgba(248,113,113,0.15)',
                        borderColor:
                          b.status === 'confirmed' ? 'var(--adm-success)' :
                          b.status === 'pending' ? 'var(--adm-gold)' :
                          b.status === 'completed' ? '#4285f4' : 'var(--adm-danger)',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                      value={b.status || 'confirmed'}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      id={`booking-status-select-${b.id}`}
                    >
                      <option value="confirmed" style={{ background: '#1a1917', color: '#4ade80' }}>✓ Confirmed</option>
                      <option value="pending" style={{ background: '#1a1917', color: '#d4a843' }}>⏳ Pending</option>
                      <option value="completed" style={{ background: '#1a1917', color: '#8ab4f8' }}>✨ Completed</option>
                      <option value="cancelled" style={{ background: '#1a1917', color: '#f87171' }}>✕ Cancelled</option>
                    </select>

                    {/* Google Calendar 1-Click Button */}
                    <a
                      href={getGCalLink(b)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn--secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        padding: '5px 10px',
                        background: 'rgba(66,133,244,0.15)',
                        borderColor: 'rgba(66,133,244,0.3)',
                        color: '#8ab4f8',
                      }}
                      title="Add or open this event in Google Calendar"
                      id={`gcal-link-${b.id}`}
                    >
                      <span>📅</span> Add to Google Calendar ↗
                    </a>

                    {/* WhatsApp Client Button */}
                    {b.customer_phone && (
                      <a
                        href={getWhatsAppLink(b)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn--secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          padding: '5px 10px',
                          background: 'rgba(37,211,102,0.12)',
                          borderColor: 'rgba(37,211,102,0.3)',
                          color: '#25D366',
                        }}
                        title="Chat with customer on WhatsApp"
                      >
                        <span>💬</span> WhatsApp
                      </a>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                      onClick={() => handleDelete(b.id)}
                      title="Delete appointment"
                      id={`delete-booking-${b.id}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: GOOGLE CALENDAR EMBED & SETUP */}
      {activeView === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Google Calendar ID Configuration Card */}
          <div className="admin-section-card">
            <h3 className="admin-section-title">⚙️ Salon Google Calendar Connection</h3>
            <p className="admin-section-hint">
              Enter your salon's Google Calendar Email (e.g. <code>yoursalon@gmail.com</code>) or Calendar ID.
              All appointments will be displayed directly inside this calendar view.
            </p>
            <div style={{ display: 'flex', gap: '8px', maxWidth: '600px' }}>
              <input
                type="text"
                className="admin-input"
                placeholder="yoursalon@gmail.com or c_...calendar.google.com"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                id="google-calendar-id-input"
              />
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={saveCalendarId}
                id="save-calendar-id-btn"
              >
                {calendarSaved ? '✓ Saved!' : 'Save Calendar'}
              </button>
            </div>
          </div>

          {/* Embedded Google Calendar */}
          <div className="admin-section-card" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem 1rem' }}>
              <div style={{ fontWeight: 600, color: '#fff' }}>
                📆 Live Google Calendar {calendarId && <span style={{ color: 'var(--adm-text-2)', fontSize: '0.8rem', fontWeight: 400 }}>({calendarId})</span>}
              </div>
              <a
                href={calendarId ? `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}` : 'https://calendar.google.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--secondary"
                style={{ fontSize: '0.75rem' }}
              >
                Open Full Screen in Google Calendar ↗
              </a>
            </div>

            {calendarId && embedUrl ? (
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--adm-border)', background: '#1a1917' }}>
                <iframe
                  src={embedUrl}
                  style={{ width: '100%', height: '640px', border: 0 }}
                  title="Google Calendar Embed"
                  loading="lazy"
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--adm-border)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
                <h4 style={{ color: '#fff', marginBottom: '6px' }}>Connect Your Google Calendar</h4>
                <p style={{ color: 'var(--adm-text-2)', fontSize: '0.82rem', maxWidth: '500px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                  Enter your Gmail / Google Calendar address above to view all appointments in an interactive monthly and weekly calendar right here.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => {
                      setCalendarId('en.indian#holiday@group.v.calendar.google.com');
                    }}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Test with Sample Google Calendar
                  </button>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn--primary"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Go to Google Calendar ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW APPOINTMENT */}
      {showAddModal && (
        <div className="admin-confirm-overlay" style={{ zIndex: 1100 }}>
          <div className="admin-confirm-card" style={{ maxWidth: '520px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>+ New Appointment</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--adm-text-2)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="admin-form-group">
                <label className="admin-label">Client Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newBooking.customer_name}
                  onChange={(e) => setNewBooking(b => ({ ...b, customer_name: e.target.value }))}
                  id="new-booking-name"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="admin-input"
                    required
                    placeholder="+91 98765 43210"
                    value={newBooking.customer_phone}
                    onChange={(e) => setNewBooking(b => ({ ...b, customer_phone: e.target.value }))}
                    id="new-booking-phone"
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-label">Email (Optional)</label>
                  <input
                    type="email"
                    className="admin-input"
                    placeholder="client@email.com"
                    value={newBooking.customer_email}
                    onChange={(e) => setNewBooking(b => ({ ...b, customer_email: e.target.value }))}
                    id="new-booking-email"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Service</label>
                <select
                  className="admin-input"
                  value={newBooking.service_name}
                  onChange={(e) => {
                    const sel = (salonData.services || []).find(s => s.name === e.target.value);
                    setNewBooking(b => ({
                      ...b,
                      service_name: e.target.value,
                      service_price: sel ? sel.price : b.service_price,
                      duration: sel ? sel.duration : b.duration,
                    }));
                  }}
                  id="new-booking-service"
                >
                  {(salonData.services || salon.services || []).map(s => (
                    <option key={s.id || s.name} value={s.name} style={{ background: '#1a1917' }}>
                      {s.name} — ₹{s.price} ({s.duration || '60 min'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-label">Appointment Date *</label>
                  <input
                    type="date"
                    className="admin-input"
                    required
                    value={newBooking.booking_date}
                    onChange={(e) => setNewBooking(b => ({ ...b, booking_date: e.target.value }))}
                    id="new-booking-date"
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-label">Time *</label>
                  <input
                    type="time"
                    className="admin-input"
                    required
                    value={newBooking.booking_time}
                    onChange={(e) => setNewBooking(b => ({ ...b, booking_time: e.target.value }))}
                    id="new-booking-time"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Notes (Optional)</label>
                <textarea
                  className="admin-input admin-textarea"
                  rows={2}
                  placeholder="Special requests or client preferences..."
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking(b => ({ ...b, notes: e.target.value }))}
                  id="new-booking-notes"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  id="new-booking-submit"
                >
                  Create & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
