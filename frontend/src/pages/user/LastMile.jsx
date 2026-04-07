import { useState } from 'react';

const VEHICLES = [
  {
    id: 'prepaid_taxi',
    category: 'Taxi & Cab',
    emoji: '🚖',
    name: 'Pre-paid Taxi',
    provider: 'Official counter inside station',
    fare: '₹40 base + ₹12/km',
    eta: '2–5 min',
    availability: 'high',
    exits: ['main_exit', 'south_exit'],
    features: ['Meter sealed', 'Receipt issued', 'Fixed fares'],
    color: '#e8a020',
  },
  {
    id: 'ola',
    category: 'App Cab',
    emoji: '🚗',
    name: 'Ola Cab',
    provider: 'Ola • App-based',
    fare: '₹45 base + surge',
    eta: '4–10 min',
    availability: 'high',
    exits: ['main_exit'],
    features: ['Track ride', 'AC available', 'Bill auto-generated'],
    color: '#22c55e',
    appLink: 'https://www.olacabs.com',
  },
  {
    id: 'uber',
    category: 'App Cab',
    emoji: '🚙',
    name: 'Uber',
    provider: 'Uber • App-based',
    fare: '₹50 base + surge',
    eta: '5–12 min',
    availability: 'medium',
    exits: ['main_exit'],
    features: ['GPS tracked', 'Share fare', 'Safety features'],
    color: '#000',
    appLink: 'https://www.uber.com',
  },
  {
    id: 'e_rickshaw',
    category: 'Eco Transport',
    emoji: '🛺',
    name: 'E-Rickshaw',
    provider: 'Local operators',
    fare: '₹20–40 fixed',
    eta: '1–3 min',
    availability: 'high',
    exits: ['main_exit', 'north_exit'],
    features: ['Eco-friendly', 'Short distances', 'No fuel surcharge'],
    color: '#27ae60',
  },
  {
    id: 'cycle_rickshaw',
    category: 'Eco Transport',
    emoji: '🚲',
    name: 'Cycle Rickshaw',
    provider: 'Local operators',
    fare: '₹15–25',
    eta: '1–2 min',
    availability: 'high',
    exits: ['main_exit'],
    features: ['Zero emission', 'Last 1–2 km only'],
    color: '#84cc16',
  },
  {
    id: 'shared_tempo',
    category: 'Shared',
    emoji: '🚐',
    name: 'Shared Tempo / Vikram',
    provider: 'City route service',
    fare: '₹10–20 per seat',
    eta: '5–10 min',
    availability: 'medium',
    exits: ['south_exit'],
    features: ['Fixed city routes', 'Very economical', 'Runs till midnight'],
    color: '#e67e22',
  },
  {
    id: 'city_bus',
    category: 'Shared',
    emoji: '🚌',
    name: 'JKRTC City Bus',
    provider: 'J&K Road Transport Corporation',
    fare: '₹8–15',
    eta: '10–20 min',
    availability: 'medium',
    exits: ['bus_bay'],
    features: ['Air cooled', 'Senior concession', 'Pass accepted'],
    color: '#3b82f6',
  },
  {
    id: 'mini_bus',
    category: 'Shared',
    emoji: '🚎',
    name: 'Mini Bus / Maxicab',
    provider: 'Private operators',
    fare: '₹15–30',
    eta: '5–15 min',
    availability: 'medium',
    exits: ['bus_bay'],
    features: ['City + intercity', 'Runs on demand'],
    color: '#8b5cf6',
  },
  {
    id: 'airport_taxi',
    category: 'Airport',
    emoji: '✈️',
    name: 'Airport Shuttle',
    provider: 'Srinagar & Jammu Airport',
    fare: '₹350–600 fixed',
    eta: 'Scheduled runs',
    availability: 'low',
    exits: ['main_exit'],
    features: ['Luggage space', 'AC', 'Door-to-door', 'Pre-book recommended'],
    color: '#06b6d4',
  },
  {
    id: 'irctc_taxi',
    category: 'Premium',
    emoji: '🏷️',
    name: 'IRCTC Taxi Service',
    provider: 'Indian Railways Tourism',
    fare: '₹60 base + ₹15/km',
    eta: '3–8 min',
    availability: 'medium',
    exits: ['main_exit'],
    features: ['Pan-India booking', 'Insured drivers', 'Cancel policy'],
    color: '#dc2626',
    appLink: 'https://www.irctctourism.com',
  },
  {
    id: 'heritage_cab',
    category: 'Tourism',
    emoji: '🗺️',
    name: 'Heritage Cab (Jammu Tour)',
    provider: 'J&K Tourism Dept.',
    fare: '₹200/hr, min 2 hrs',
    eta: 'On booking',
    availability: 'low',
    exits: ['main_exit'],
    features: ['English-speaking guide', 'Covers Bahu Fort, Raghunath Temple', 'AC vehicle'],
    color: '#f59e0b',
  },
  {
    id: 'vaishno_bus',
    category: 'Tourism',
    emoji: '🏔️',
    name: 'Katra / Vaishno Devi Bus',
    provider: 'SRTC + Private',
    fare: '₹80–120',
    eta: 'Fixed schedule',
    availability: 'high',
    exits: ['bus_bay'],
    features: ['Direct to Katra base camp', 'Frequent departures', 'Luggage hold'],
    color: '#a855f7',
  },
];

const CATEGORY_ORDER = ['Taxi & Cab', 'App Cab', 'Eco Transport', 'Shared', 'Premium', 'Airport', 'Tourism'];

const AVAIL_COLOR = { high: '#27ae60', medium: '#e67e22', low: '#e74c3c' };
const AVAIL_LABEL = { high: 'Available', medium: 'Limited', low: 'Pre-book' };

export default function LastMile() {
  const [category, setCategory] = useState('All');
  const [booking, setBooking] = useState(null); // vehicle being booked
  const [search, setSearch] = useState('');

  const categories = ['All', ...CATEGORY_ORDER];
  const filtered = VEHICLES.filter(v => {
    const matchCat = category === 'All' || v.category === category;
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.provider.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1>🚕 Last Mile Connectivity</h1>
        <p>Transport options from Jammu Tawi Railway Station — tap any card to book</p>
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          placeholder="🔍 Search transport…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <div className="tab-bar">
          {categories.map(c => (
            <button key={c} className={`tab-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-4">
        {[
          { icon: '🚗', label: 'Total Options', value: VEHICLES.length },
          { icon: '✅', label: 'Available Now', value: VEHICLES.filter(v => v.availability === 'high').length },
          { icon: '🌿', label: 'Eco-Friendly', value: VEHICLES.filter(v => v.category === 'Eco Transport').length },
          { icon: '📱', label: 'App-Based', value: VEHICLES.filter(v => v.appLink).length },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color: 'var(--accent-saffron)', fontSize: '1.5rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle grid */}
      {CATEGORY_ORDER.filter(cat => category === 'All' || cat === category).map(cat => {
        const inCat = filtered.filter(v => v.category === cat);
        if (!inCat.length) return null;
        return (
          <div key={cat}>
            <div className="section-title" style={{ marginBottom: '0.75rem' }}>{cat}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
              {inCat.map(v => (
                <VehicleCard key={v.id} vehicle={v} onBook={() => setBooking(v)} />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
          No transport found for "{search}"
        </div>
      )}

      {/* Booking modal */}
      {booking && <BookingModal vehicle={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

function VehicleCard({ vehicle: v, onBook }) {
  return (
    <div
      className="transport-card"
      onClick={onBook}
      style={{ borderLeft: `3px solid ${v.color}22` }}
    >
      <div style={{
        width: 50, height: 50, borderRadius: 12, flexShrink: 0,
        background: `${v.color}18`, border: `1px solid ${v.color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem',
      }}>
        {v.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <span className="transport-name">{v.name}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: AVAIL_COLOR[v.availability],
            background: `${AVAIL_COLOR[v.availability]}18`, borderRadius: 20, padding: '1px 7px',
            flexShrink: 0, border: `1px solid ${AVAIL_COLOR[v.availability]}30`,
          }}>
            {AVAIL_LABEL[v.availability]}
          </span>
        </div>
        <div className="transport-detail">{v.provider}</div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-saffron)', fontFamily: 'DM Mono', fontWeight: 600 }}>
            {v.fare}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
            ⏱ {v.eta}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: 5 }}>
          {v.features.slice(0, 2).map(f => (
            <span key={f} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: 4, padding: '1px 6px', border: '1px solid var(--border)' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingModal({ vehicle: v, onClose }) {
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'done'
  const [pickup, setPickup] = useState('Main Exit Gate, Jammu Tawi Station');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('now');
  const [passengers, setPassengers] = useState(1);
  const [bookingId, setBookingId] = useState('');

  const confirm = () => {
    const id = `SAH-${Date.now().toString(36).toUpperCase()}`;
    setBookingId(id);
    setStep('done');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 480 }}>
        {step === 'done' ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>✅</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Booking Confirmed!</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {v.emoji} {v.name} · {v.provider}
            </div>
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 10, padding: '1rem',
              marginBottom: '1.25rem', border: '1px solid var(--border-accent)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Booking Reference</div>
              <div style={{ fontFamily: 'DM Mono', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-saffron)', letterSpacing: 2 }}>{bookingId}</div>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              📍 <strong>Pickup:</strong> {pickup}<br />
              🏁 <strong>Drop:</strong> {destination || 'City Centre'}<br />
              ⏱ <strong>ETA:</strong> {v.eta} · <strong>Fare:</strong> {v.fare}
            </div>
            <button className="btn btn-primary w-full" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${v.color}18`, border: `1px solid ${v.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>{v.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{v.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.provider}</div>
                </div>
              </div>
              <button className="btn-icon" onClick={onClose}>✕</button>
            </div>

            {/* Fare summary */}
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.875rem',
              marginBottom: '1.25rem', display: 'flex', gap: '1.5rem',
              border: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estimated Fare</div>
                <div style={{ fontFamily: 'DM Mono', fontWeight: 700, color: 'var(--accent-saffron)', fontSize: '1.05rem' }}>{v.fare}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ETA</div>
                <div style={{ fontFamily: 'DM Mono', fontWeight: 700 }}>{v.eta}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Availability</div>
                <div style={{ fontWeight: 700, color: AVAIL_COLOR[v.availability] }}>{AVAIL_LABEL[v.availability]}</div>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div className="input-group">
                <label className="label">📍 Pickup Point</label>
                <input className="input" value={pickup} onChange={e => setPickup(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="label">🏁 Destination</label>
                <input className="input" placeholder="e.g. Bus Stand, Old City, Airport…" value={destination} onChange={e => setDestination(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="label">⏰ When</label>
                  <select className="input" value={time} onChange={e => setTime(e.target.value)}>
                    <option value="now">Now</option>
                    <option value="15">In 15 min</option>
                    <option value="30">In 30 min</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="label">👥 Passengers</label>
                  <select className="input" value={passengers} onChange={e => setPassengers(+e.target.value)}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              {v.features.length > 0 && (
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {v.features.map(f => (
                    <span key={f} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', borderRadius: 5, padding: '2px 8px', border: '1px solid var(--border)' }}>{f}</span>
                  ))}
                </div>
              )}
            </div>

            {v.appLink ? (
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <a href={v.appLink} target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
                >
                  Open App ↗
                </a>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirm} disabled={!destination}>
                  Book via Sahyatri
                </button>
              </div>
            ) : (
              <button className="btn btn-primary w-full" onClick={confirm} disabled={!destination}>
                Confirm Booking
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
