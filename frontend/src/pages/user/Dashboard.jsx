import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { geoAPI } from '../../services/api';
import StationMap from '../../components/Map/StationMap';
import RoutePanel from '../../components/Navigation/RoutePanel';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { analyticsAPI_req } from '../../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { crowdData, connected } = useSocket();
  const navigate = useNavigate();

  const [stationGeo, setStationGeo] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([geoAPI.getStation(), geoAPI.getGraph()])
      .then(([geo, graph]) => {
        setStationGeo(geo.data);
        setGraphData(graph.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRouteComputed = async (result) => {
    setRouteResult(result);
    if (result) {
      try {
        await analyticsAPI_req.logNavigation({
          userId: user?._id,
          sourceNode: result.source,
          destNode: result.dest,
          pathNodes: result.path,
          totalDistance: result.realDistance,
          estimatedTime: result.etaSeconds,
          accessibilityMode: user?.preferences?.accessibilityMode || 'none',
          crowdAware: true,
        });
      } catch (_) {}
    }
  };

  // Crowd summary stats
  const crowdSummary = graphData ? (() => {
    const counts = { low: 0, medium: 0, high: 0 };
    Object.values(crowdData).forEach(v => {
      const d = typeof v === 'string' ? v : v?.density;
      if (d) counts[d]++;
    });
    return counts;
  })() : null;

  if (loading) return <LoadingSpinner message="Loading station map…" fullPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p>Navigate Sahyatri Junction in real time</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-danger" onClick={() => navigate('/emergency')} id="quick-emergency-btn">🚨 Emergency</button>
        </div>
      </div>

      {/* Crowd stats */}
      {crowdSummary && (
        <div className="grid-3 grid">
          {[
            { label: 'Low Density', count: crowdSummary.low,    color: 'var(--crowd-low)',    icon: '🟢', bg: 'rgba(34,197,94,0.1)' },
            { label: 'Medium',      count: crowdSummary.medium, color: 'var(--crowd-medium)', icon: '🟡', bg: 'rgba(245,158,11,0.1)' },
            { label: 'High Density',count: crowdSummary.high,   color: 'var(--crowd-high)',   icon: '🔴', bg: 'rgba(239,68,68,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderColor: `${s.color}30`, background: s.bg }}>
              <div className="stat-icon" style={{ background: `${s.color}22`, fontSize: '1.3rem' }}>{s.icon}</div>
              <div>
                <div className="stat-value" style={{ color: s.color }}>{s.count}</div>
                <div className="stat-label">{s.label} Zones</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main split: Map + Route Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="section-title">🗺️ Station Map</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: connected ? 'var(--crowd-low)' : 'var(--text-muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? 'var(--crowd-low)' : 'var(--text-muted)', animation: 'pulse-dot 2s infinite' }} />
              Live crowd data
            </div>
          </div>
          <StationMap
            stationGeo={stationGeo}
            graphData={graphData}
            routeCoords={routeResult?.coords}
            showCrowdHeatmap
            height="480px"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="section-title" style={{ marginBottom: '1rem' }}>🧭 Find Route</div>
            {graphData ? (
              <RoutePanel graphData={graphData} onRouteComputed={handleRouteComputed} />
            ) : <LoadingSpinner message="Loading graph…" />}
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div>
        <div className="section-title" style={{ marginBottom: '1rem' }}>⚡ Quick Access</div>
        <div className="grid-4 grid">
          {[
            { icon: '🧭', label: 'Full Navigation', to: '/navigation' },
            { icon: '🚨', label: 'Emergency Help', to: '/emergency' },
            { icon: '♿', label: 'Accessibility', to: '/accessibility' },
            { icon: '🚕', label: 'Last Mile', to: '/last-mile' },
          ].map(item => (
            <button key={item.to} className="card" style={{ textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border)' }}
              onClick={() => navigate(item.to)}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:1100px){.main-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
