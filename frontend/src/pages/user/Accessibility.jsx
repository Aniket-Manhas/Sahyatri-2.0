import { useAccessibility } from '../../contexts/AccessibilityContext';

const MODES = [
  { id: 'none',             label: 'Standard Mode',       icon: '🚶', desc: 'No special routing constraints' },
  { id: 'wheelchair',       label: 'Wheelchair User',     icon: '♿', desc: 'Avoids stairs, prefers lifts and ramps' },
  { id: 'elderly',          label: 'Elderly / Slow Walk', icon: '🧓', desc: 'Avoids stairs, prefers shorter routes' },
  { id: 'visually_impaired',label: 'Visually Impaired',   icon: '🦯', desc: 'High-contrast UI, simplified directions' },
];

export default function Accessibility() {
  const { settings, updateSettings, isAccessible } = useAccessibility();

  const toggle = (field) => updateSettings({ [field]: !settings[field] });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 760 }}>
      <div>
        <h1>♿ Accessibility Settings</h1>
        <p>Customize navigation and display for your needs. All settings are saved to your profile.</p>
      </div>

      {/* Navigation mode */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: '1rem' }}>🚶 Navigation Mode</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => updateSettings({
              mode: m.id,
              avoidStairs: m.id !== 'none',
              preferLift: m.id === 'wheelchair' || m.id === 'elderly',
            })} style={{
              padding: '1rem', borderRadius: 12,
              border: `2px solid ${settings.mode === m.id ? 'var(--accent-blue)' : 'var(--border)'}`,
              background: settings.mode === m.id ? 'rgba(59,130,246,0.12)' : 'var(--bg-secondary)',
              textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{m.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Routing preferences */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: '1rem' }}>🗺️ Routing Preferences</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'avoidStairs', label: 'Avoid Stairs',    icon: '🪜', desc: 'Route will use lifts or ramps instead' },
            { key: 'preferLift',  label: 'Prefer Lifts',    icon: '🛗', desc: 'Prioritize lift routes over ramps' },
          ].map(pref => (
            <div key={pref.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', background: 'var(--bg-secondary)', borderRadius: 10 }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>{pref.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pref.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pref.desc}</div>
                </div>
              </div>
              <button onClick={() => toggle(pref.key)} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: settings[pref.key] ? 'var(--accent-blue)' : 'var(--border-bright)',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: settings[pref.key] ? 23 : 3,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Display settings */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: '1rem' }}>🖥️ Display Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'highContrast', label: 'High Contrast Mode', icon: '🔆', desc: 'Black background with bright text and colors' },
            { key: 'largeText',    label: 'Large Text Mode',    icon: '🔡', desc: 'Increases font size throughout the app' },
          ].map(pref => (
            <div key={pref.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', background: 'var(--bg-secondary)', borderRadius: 10 }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>{pref.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pref.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pref.desc}</div>
                </div>
              </div>
              <button onClick={() => toggle(pref.key)} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: settings[pref.key] ? 'var(--accent-blue)' : 'var(--border-bright)',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: settings[pref.key] ? 23 : 3,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isAccessible && (
        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: '1rem', fontSize: '0.875rem', color: 'var(--accent-blue)' }}>
          ♿ <strong>Accessibility routing active:</strong> Navigation will automatically avoid stairs and prefer accessible routes.
        </div>
      )}
    </div>
  );
}
