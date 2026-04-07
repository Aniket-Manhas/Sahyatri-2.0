import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { geoAPI } from '../../services/api';
import StationMap from '../../components/Map/StationMap';
import RoutePanel from '../../components/Navigation/RoutePanel';
import CameraDetector from '../../components/Crowd/CameraDetector';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { analyticsAPI_req } from '../../services/api';

export default function Navigation() {
  const { user } = useAuth();
  const { crowdData } = useSocket();
  const [stationGeo, setStationGeo] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [selectedNode, setSelectedNode] = useState('concourse');
  const [activeTab, setActiveTab] = useState('navigate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([geoAPI.getStation(), geoAPI.getGraph()])
      .then(([geo, graph]) => { setStationGeo(geo.data); setGraphData(graph.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleRouteComputed = async (result) => {
    setRouteResult(result);
    if (result) {
      try {
        await analyticsAPI_req.logNavigation({
          userId: user?._id, sourceNode: result.source, destNode: result.dest,
          pathNodes: result.path, totalDistance: result.realDistance,
          estimatedTime: result.etaSeconds, crowdAware: true,
        });
      } catch (_) {}
    }
  };

  if (loading) return <LoadingSpinner message="Loading navigation system…" fullPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1>🧭 Navigation</h1>
        <p>Get step-by-step directions with real-time crowd awareness</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Map */}
        <div>
          <StationMap
            stationGeo={stationGeo}
            graphData={graphData}
            routeCoords={routeResult?.coords}
            onNodeClick={(node) => setSelectedNode(node.id)}
            selectedSource={routeResult?.source}
            selectedDest={routeResult?.dest}
            showCrowdHeatmap
            height="calc(100vh - 220px)"
          />
          {routeResult && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
              <span>🗺️ <strong>{Math.round(routeResult.realDistance)}m</strong></span>
              <span>⏱️ ~<strong>{Math.ceil(routeResult.etaSeconds / 60)} min</strong> walk</span>
              <span>📍 <strong>{routeResult.path.length}</strong> waypoints</span>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === 'navigate' ? 'active' : ''}`} onClick={() => setActiveTab('navigate')}>🧭 Route</button>
            <button className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`} onClick={() => setActiveTab('camera')}>📷 Camera</button>
          </div>

          {activeTab === 'navigate' && (
            <div className="card">
              {graphData ? <RoutePanel graphData={graphData} onRouteComputed={handleRouteComputed} /> : <LoadingSpinner />}
            </div>
          )}

          {activeTab === 'camera' && (
            <CameraDetector
              selectedNode={selectedNode}
              graphData={graphData}
              onCrowdReport={(r) => r.changeNode && setSelectedNode(r.changeNode)}
            />
          )}

          {/* Crowd legend for nearby nodes */}
          {graphData && (
            <div className="card">
              <div className="section-title" style={{ marginBottom: '0.875rem' }}>📊 Nearby Crowd Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
                {Object.values(graphData.nodes).filter(n => n.type !== 'boundary').slice(0, 12).map(node => {
                  const entry = crowdData[node.id];
                  const density = entry ? (typeof entry === 'string' ? entry : entry.density) : 'low';
                  return (
                    <div key={node.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{node.name}</span>
                      <span className={`badge badge-${density}`}>
                        <span className={`crowd-dot ${density}`} style={{ width: 7, height: 7 }} />
                        {density}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
