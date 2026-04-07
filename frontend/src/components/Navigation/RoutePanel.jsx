import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { dijkstra, formatETA, pathToCoordinates, buildStepDirections } from '../../services/dijkstra';

const TYPE_ICONS = {
  gate:'🚪', platform:'🚉', platform_zone:'🚋', ticket:'🎫',
  concourse:'🏛️', waiting:'🪑', bridge:'🌉', lift:'🛗',
  stairs:'🪜', ramp:'♿', food:'🍽️', restroom:'🚻',
  medical:'🏥', inquiry:'❓', atm:'🏧', boundary:'',
};

export default function RoutePanel({ graphData, onRouteComputed }) {
  const { crowdData } = useSocket();
  const { settings } = useAccessibility();

  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [crowdAware, setCrowdAware] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [computing, setComputing] = useState(false);

  const nodes = graphData?.nodes || {};
  const nodeList = Object.values(nodes).filter(n => n.type !== 'boundary');

  const buildCrowdMap = () => {
    const map = {};
    Object.entries(crowdData).forEach(([id, val]) => {
      map[id] = typeof val === 'string' ? val : val?.density || 'low';
    });
    return map;
  };

  const compute = () => {
    if (!source || !dest) { setError('Please select both source and destination'); return; }
    if (source === dest) { setError('Source and destination cannot be the same'); return; }
    setError('');
    setComputing(true);

    setTimeout(() => {
      try {
        const res = dijkstra({
          graphData,
          source,
          destination: dest,
          crowdData: crowdAware ? buildCrowdMap() : {},
          accessibilityMode: settings.mode,
          avoidStairs: settings.avoidStairs,
        });
        if (!res) {
          setError('No path found between selected locations. Try disabling accessibility filters.');
          setResult(null);
          onRouteComputed?.(null);
        } else {
          const steps = buildStepDirections(res.path, nodes, graphData);
          const coords = pathToCoordinates(res.path, nodes);
          setResult({ ...res, steps, coords });
          onRouteComputed?.({ ...res, steps, coords, source, dest });
        }
      } catch (e) {
        setError('Error computing route: ' + e.message);
      }
      setComputing(false);
    }, 100);
  };

  const swap = () => { setSource(dest); setDest(source); setResult(null); };

  const groupedNodes = nodeList.reduce((acc, n) => {
    if (!acc[n.type]) acc[n.type] = [];
    acc[n.type].push(n);
    return acc;
  }, {});

  const typeLabel = t => ({
    gate:'Gates', platform:'Platforms', platform_zone:'Platform Zones',
    ticket:'Ticket Counters', concourse:'Concourse', waiting:'Waiting Areas',
    bridge:'Foot Over Bridge', lift:'Lifts', stairs:'Stairs', ramp:'Ramps',
    food:'Food & Beverages', restroom:'Restrooms', medical:'Medical',
    inquiry:'Help Desk', atm:'ATM'
  }[t] || t);

  const NodeSelect = ({ value, onChange, id }) => (
    <select className="input" value={value} onChange={e => onChange(e.target.value)} id={id}>
      <option value="">-- Select location --</option>
      {Object.entries(groupedNodes).map(([type, list]) => (
        <optgroup key={type} label={`${TYPE_ICONS[type] || ''} ${typeLabel(type)}`}>
          {list.map(n => {
            const crowd = crowdData[n.id];
            const density = typeof crowd === 'string' ? crowd : crowd?.density;
            const indicator = density === 'high' ? '🔴' : density === 'medium' ? '🟡' : '';
            return <option key={n.id} value={n.id}>{indicator} {n.name}</option>;
          })}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Source & Destination */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: '0.5rem' }}>
        <div className="input-group">
          <label className="label">From</label>
          <NodeSelect value={source} onChange={v => { setSource(v); setResult(null); }} id="route-source" />
        </div>
        <button className="btn-icon" onClick={swap} title="Swap" style={{ marginBottom: 2, fontSize: '1.2rem' }}>⇅</button>
        <div className="input-group">
          <label className="label">To</label>
          <NodeSelect value={dest} onChange={v => { setDest(v); setResult(null); }} id="route-dest" />
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={crowdAware} onChange={e => setCrowdAware(e.target.checked)} />
          🔄 Avoid congested areas
        </label>
        {settings.avoidStairs && (
          <span className="badge badge-info">♿ Accessibility mode active</span>
        )}
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.85rem', color: 'var(--crowd-high)' }}>{error}</div>}

      <button className="btn btn-primary w-full" onClick={compute} disabled={computing || !source || !dest} id="find-route-btn">
        {computing ? '⏳ Computing…' : '🧭 Find Route'}
      </button>

      {/* Result */}
      {result && (
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{formatETA(result.etaSeconds)}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Walk time</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{Math.round(result.realDistance)}m</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Distance</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7' }}>{result.path.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Waypoints</div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {result.steps.map((s, i) => (
              <div key={i} className="direction-step">
                <div className="step-num">{s.stepNum}</div>
                <div>
                  <div className="step-name">
                    {s.hasLift ? '🛗 ' : s.hasStairs ? '🪜 ' : s.hasRamp ? '♿ ' : `${TYPE_ICONS[s.type] || '➡️'} `}
                    {s.instruction}
                  </div>
                  <div className="step-dist">{s.distance}m</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
