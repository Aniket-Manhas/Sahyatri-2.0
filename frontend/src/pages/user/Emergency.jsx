import { useState, useEffect } from 'react';
import { geoAPI, alertsAPI } from '../../services/api';
import PanicButton from '../../components/Emergency/PanicButton';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function Emergency() {
  const { user } = useAuth();
  const [graphData, setGraphData] = useState(null);
  const [currentNode, setCurrentNode] = useState('concourse');
  const [myAlerts, setMyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([geoAPI.getGraph(), alertsAPI.getMy()])
      .then(([graph, alerts]) => {
        setGraphData(graph.data);
        setMyAlerts(alerts.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { active: 'var(--crowd-high)', acknowledged: 'var(--crowd-medium)', resolved: 'var(--crowd-low)' };
  const statusIcon  = { active: '🔴', acknowledged: '🟡', resolved: '✅' };

  if (loading) return <LoadingSpinner message="Loading emergency system…" fullPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: 'var(--crowd-high)' }}>🚨 Emergency & Safety</h1>
        <p>Tap the emergency button to immediately alert station staff with your location.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Panic button card */}
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="section-title">🆘 Emergency Alert</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Your location will be sent to station control room instantly.</p>
          </div>

          {/* Current location selector */}
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label className="label">Your Current Location</label>
            <select className="input" value={currentNode} onChange={e => setCurrentNode(e.target.value)} id="current-location-select">
              {graphData && Object.values(graphData.nodes).filter(n => n.type !== 'boundary').map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Select your nearest landmark</small>
          </div>

          <PanicButton currentNodeId={currentNode} graphData={graphData} />
        </div>

        {/* Right info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Emergency contacts */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: '1rem' }}>📞 Station Helpline</div>
            {[
              { label: 'Control Room', number: '139', icon: '🚨' },
              { label: 'Medical Emergency', number: '112', icon: '🏥' },
              { label: 'Railway Police (RPF)', number: '182', icon: '👮' },
              { label: 'Fire / Civil Defence', number: '101', icon: '🔥' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.875rem' }}>{c.icon} {c.label}</span>
                <a href={`tel:${c.number}`} style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '1.1rem', textDecoration: 'none' }}>{c.number}</a>
              </div>
            ))}
          </div>

          {/* Safety tips */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: '0.75rem' }}>🛡️ Safety Tips</div>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
              <li>Stay calm and stay where you are after pressing emergency</li>
              <li>Move towards gates if you smell smoke or gas</li>
              <li>Use lifts/ramps in case of injury, avoid stairs</li>
              <li>Follow instructions from uniformed staff</li>
              <li>Do not block emergency corridors</li>
            </ul>
          </div>
        </div>
      </div>

      {/* My alert history */}
      {myAlerts.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: '1rem' }}>📋 My Alert History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {myAlerts.map(alert => (
              <div key={alert._id} className={`alert-item ${alert.status}`}>
                <span style={{ fontSize: '1.5rem' }}>{statusIcon[alert.status]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{alert.type.toUpperCase()} — {alert.location.nodeName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(alert.createdAt).toLocaleString()}</div>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusColor[alert.status], textTransform: 'capitalize' }}>{alert.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
