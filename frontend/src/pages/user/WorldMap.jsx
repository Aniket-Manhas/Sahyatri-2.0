import { useState } from 'react';
import OutdoorMap from '../../components/Map/OutdoorMap';
import IndoorPanel from '../../components/Map/IndoorPanel';

export default function WorldMap() {
  const [indoorOpen, setIndoorOpen] = useState(false);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 60px)', overflow: 'hidden', margin: '-1.75rem -2rem' }}>
      {/* Full-screen outdoor map */}
      <OutdoorMap onStationClick={() => setIndoorOpen(true)} />

      {/* Floating instructions */}
      {!indoorOpen && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(26,26,29,0.92)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-bright)', borderRadius: 12,
          padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem',
          fontSize: '0.85rem', color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-md)', pointerEvents: 'none',
          zIndex: 10,
          animation: 'float-fade 1s ease',
        }}>
          <span style={{ fontSize: '1.1rem' }}>🚉</span>
          Click the <strong style={{ color: 'var(--accent-saffron)' }}>Jammu Tawi Station</strong> marker to open Indoor Navigation
        </div>
      )}

      {/* Search bar overlay */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16,
        zIndex: 10, display: 'flex', gap: '0.5rem', maxWidth: 400,
      }}>
        <div style={{
          flex: 1,
          background: 'rgba(26,26,29,0.92)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-bright)',
          borderRadius: 10, padding: '0.625rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.875rem', color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span>🔍</span>
          <span>Search station or landmark…</span>
        </div>
        {indoorOpen && (
          <button
            onClick={() => setIndoorOpen(false)}
            style={{
              background: 'rgba(26,26,29,0.92)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-bright)',
              borderRadius: 10, padding: '0.625rem 1rem',
              color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            ← Outdoor
          </button>
        )}
      </div>

      {/* Map type toggle */}
      <div style={{
        position: 'absolute', bottom: 120, right: 60, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: '0.4rem',
      }}>
        <button
          onClick={() => setIndoorOpen(true)}
          style={{
            background: indoorOpen ? 'var(--accent-saffron)' : 'rgba(26,26,29,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-bright)',
            borderRadius: 8, padding: '0.5rem 0.875rem',
            color: indoorOpen ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)',
          }}
        >
          🏢 Indoor
        </button>
        <button
          onClick={() => setIndoorOpen(false)}
          style={{
            background: !indoorOpen ? 'var(--accent-saffron)' : 'rgba(26,26,29,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-bright)',
            borderRadius: 8, padding: '0.5rem 0.875rem',
            color: !indoorOpen ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)',
          }}
        >
          🌍 Outdoor
        </button>
      </div>

      {/* Indoor navigation drawer */}
      <IndoorPanel open={indoorOpen} onClose={() => setIndoorOpen(false)} />

      <style>{`
        @keyframes float-fade {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
