import { useState } from 'react';
import { alertsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ALERT_TYPES = [
  { id: 'panic',    label: 'General Emergency', icon: '🚨', color: '#ef4444' },
  { id: 'medical',  label: 'Medical Help',       icon: '🏥', color: '#f97316' },
  { id: 'fire',     label: 'Fire / Smoke',       icon: '🔥', color: '#dc2626' },
  { id: 'security', label: 'Security Issue',     icon: '🛡️', color: '#7c3aed' },
  { id: 'lost',     label: 'Lost / Confused',    icon: '❓', color: '#3b82f6' },
];

export default function PanicButton({ currentNodeId, graphData }) {
  const { user } = useAuth();
  const [stage, setStage] = useState('idle'); // idle | confirm | selecting | sending | sent
  const [alertType, setAlertType] = useState('panic');
  const [message, setMessage] = useState('');
  const [sentAlert, setSentAlert] = useState(null);
  const [countdown, setCountdown] = useState(3);

  const selectedType = ALERT_TYPES.find(t => t.id === alertType);
  const currentNode = graphData?.nodes?.[currentNodeId];

  const handlePress = () => {
    setStage('confirm');
    let c = 3;
    setCountdown(c);
    const timer = setInterval(() => {
      c--;
      setCountdown(c);
      if (c === 0) {
        clearInterval(timer);
        setStage('selecting');
      }
    }, 1000);
  };

  const cancel = () => { setStage('idle'); setCountdown(3); setSentAlert(null); };

  const sendAlert = async () => {
    setStage('sending');
    try {
      const res = await alertsAPI.triggerPanic({
        type: alertType,
        nodeId: currentNodeId || 'unknown',
        nodeName: currentNode?.name || 'Unknown Location',
        lat: currentNode?.lat,
        lng: currentNode?.lng,
        floor: currentNode?.floor || 0,
        message: message || `${selectedType?.label} — needs immediate assistance`,
      });
      setSentAlert(res.data);
      setStage('sent');
    } catch (err) {
      setStage('selecting');
      alert('Failed to send alert. Please try again or call station staff.');
    }
  };

  if (stage === 'sent') return (
    <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '4rem', animation: 'pulse-dot 1s infinite' }}>✅</div>
      <h3 style={{ color: 'var(--crowd-low)' }}>Alert Sent!</h3>
      <p style={{ maxWidth: 320 }}>Station staff have been notified. Help is on the way. Stay calm and stay where you are.</p>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', width: '100%', maxWidth: 320, textAlign: 'left' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Alert ID</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{sentAlert?._id}</div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {currentNode?.name || 'Unknown'}</div>
      </div>
      <button className="btn btn-secondary" onClick={cancel}>Close</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>

      {stage === 'idle' && (
        <>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: 320 }}>
            In case of emergency, press the button below. Station staff will be immediately notified.
          </p>
          <button className="panic-btn" onClick={handlePress} id="panic-trigger-btn">
            <span style={{ fontSize: '2.5rem' }}>🆘</span>
            <span>EMERGENCY</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Press to alert staff</span>
          </button>
          {currentNode && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              📍 Your location: <strong style={{ color: 'var(--text-secondary)' }}>{currentNode.name}</strong>
            </div>
          )}
        </>
      )}

      {stage === 'confirm' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--crowd-high)', lineHeight: 1 }}>{countdown}</div>
          <p>Alert will be sent in {countdown} seconds...</p>
          <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      )}

      {stage === 'selecting' && (
        <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ textAlign: 'center' }}>Select Emergency Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {ALERT_TYPES.map(t => (
              <button key={t.id} onClick={() => setAlertType(t.id)} style={{
                padding: '0.875rem', borderRadius: 10, border: `2px solid ${alertType === t.id ? t.color : 'var(--border)'}`,
                background: alertType === t.id ? `${t.color}22` : 'var(--bg-card)',
                color: 'var(--text-primary)', cursor: 'pointer', transition: 'var(--transition)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{t.label}</span>
              </button>
            ))}
          </div>
          <div className="input-group">
            <label className="label">Additional message (optional)</label>
            <textarea className="input" value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Describe your situation..." rows={2} style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
            <button className="btn btn-danger" onClick={sendAlert} id="send-alert-btn">
              {selectedType?.icon} Send Alert
            </button>
          </div>
        </div>
      )}

      {stage === 'sending' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" />
          <p>Sending alert to station staff…</p>
        </div>
      )}
    </div>
  );
}
