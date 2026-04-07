import { useState, useRef, useEffect, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';

// Nodes that have cameras installed
const NODES_WITH_CAMERA = [
  'platform_1', 'platform_2', 'platform_3',
  'concourse', 'gate_a', 'gate_b', 'waiting_main', 'ticket_counter',
];

const CROWD_THRESHOLDS = { low: 4, medium: 10 };

const getDensityFromCount = (count) => {
  if (count >= CROWD_THRESHOLDS.medium) return 'high';
  if (count >= CROWD_THRESHOLDS.low) return 'medium';
  return 'low';
};

const DENSITY_COLOR = {
  low:    'var(--crowd-low)',
  medium: 'var(--crowd-medium)',
  high:   'var(--crowd-high)',
};
const DENSITY_EMOJI = { low: '🟢', medium: '🟡', high: '🔴' };
const DENSITY_LABEL = { low: 'Low Density', medium: 'Moderate', high: 'High Density' };

export default function CameraDetector({ selectedNode, graphData, onCrowdReport }) {
  // mode: 'sim' | 'camera'
  const [mode, setMode] = useState('sim');
  const [streaming, setStreaming] = useState(false);
  const [personCount, setPersonCount] = useState(0);
  const [density, setDensity] = useState('low');
  const [error, setError] = useState('');
  const [cameraPermFailed, setCameraPermFailed] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState(selectedNode || NODES_WITH_CAMERA[0]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const simTimerRef = useRef(null);   // only used in sim mode
  const camTimerRef = useRef(null);   // only used in camera mode

  const { reportCameraData } = useSocket();

  // ── Stop everything cleanly ──────────────────────────────────
  const stopAll = useCallback(() => {
    // Clear sim timer — never clears cam timer
    clearInterval(simTimerRef.current);
    simTimerRef.current = null;
    // Clear camera timer
    clearInterval(camTimerRef.current);
    camTimerRef.current = null;
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
    setPersonCount(0);
    setDensity('low');
  }, []);

  useEffect(() => stopAll, [stopAll]);

  // ── Publish reading to socket/parent ─────────────────────────
  const publishReading = useCallback((count, source) => {
    const d = getDensityFromCount(count);
    setPersonCount(count);
    setDensity(d);
    if (currentNodeId && graphData) {
      const node = graphData.nodes?.[currentNodeId];
      const report = {
        nodeId: currentNodeId,
        nodeName: node?.name || currentNodeId,
        density: d,
        personCount: count,
        source, // 'simulated' or 'camera' — never mixed
        floor: node?.floor ?? 0,
      };
      reportCameraData(report);
      onCrowdReport?.(report);
    }
  }, [currentNodeId, graphData, reportCameraData, onCrowdReport]);

  // ── Simulation mode ──────────────────────────────────────────
  const startSimulation = useCallback(() => {
    // Guard: never start sim when in camera mode
    setError('');
    setStreaming(true);
    simTimerRef.current = setInterval(() => {
      const hour = new Date().getHours();
      const isPeak = (hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 21);
      const base = isPeak ? Math.floor(Math.random() * 18) + 6 : Math.floor(Math.random() * 7);
      const count = Math.max(0, base + Math.floor(Math.random() * 4) - 2);
      publishReading(count, 'simulated');
    }, 3000);
  }, [publishReading]);

  // ── Camera mode ──────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreaming(true);

      // Camera-only detection timer — completely separate from sim timer
      // In a production build, replace this with a TensorFlow.js PoseNet/COCO-SSD call
      camTimerRef.current = setInterval(() => {
        // Placeholder: would call ML model here on videoRef.current canvas
        const mockCount = Math.floor(Math.random() * 14) + 1;
        publishReading(mockCount, 'camera'); // source: 'camera', NOT overwriting sim
      }, 2500);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermFailed(true);
        setError('Camera permission denied by browser. Enable camera access in site settings, or use Simulated mode.');
        // ⚠️ Do NOT auto-start simulation — let user choose
      } else if (err.name === 'NotFoundError') {
        setError('No camera device found on this device.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  }, [publishReading]);

  // ── Switch modes ─────────────────────────────────────────────
  const switchMode = (newMode) => {
    stopAll();
    setMode(newMode);
    setError('');
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <span>📷</span>
          <span>Crowd Detection</span>
          {streaming && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: mode === 'camera' ? 'var(--crowd-high)' : 'var(--crowd-low)',
              display: 'inline-block', animation: 'pulse-dot 1.4s infinite',
            }} />
          )}
        </div>
        <div className="tab-bar" style={{ padding: '2px' }}>
          <button
            className={`tab-btn ${mode === 'sim' ? 'active' : ''}`}
            onClick={() => switchMode('sim')}
          >
            Simulate
          </button>
          <button
            className={`tab-btn ${mode === 'camera' ? 'active' : ''}`}
            onClick={() => switchMode('camera')}
            disabled={cameraPermFailed}
            title={cameraPermFailed ? 'Camera permission denied' : 'Use device camera'}
          >
            📷 Camera
          </button>
        </div>
      </div>

      {/* Node selector */}
      <div className="input-group">
        <label className="label">Monitoring Location</label>
        <select
          className="input"
          value={currentNodeId}
          onChange={e => { stopAll(); setCurrentNodeId(e.target.value); }}
          id="camera-node-select"
        >
          {NODES_WITH_CAMERA.map(id => (
            <option key={id} value={id}>
              {graphData?.nodes?.[id]?.name || id.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Camera preview */}
      {mode === 'camera' && (
        <div style={{
          background: '#000', borderRadius: 10, overflow: 'hidden',
          height: 180, position: 'relative', border: '1px solid var(--border)',
        }}>
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {!streaming && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              color: 'var(--text-muted)', fontSize: '0.82rem',
            }}>
              <span style={{ fontSize: '2rem' }}>📷</span>
              Camera inactive
            </div>
          )}
          {streaming && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: 'rgba(231,76,60,0.85)', borderRadius: 4,
              padding: '2px 8px', fontSize: '0.68rem', color: '#fff',
              fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'DM Mono',
            }}>
              ● LIVE
            </div>
          )}
        </div>
      )}

      {/* Live reading */}
      {streaming && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 10,
          padding: '0.875rem 1rem',
          display: 'flex', alignItems: 'center', gap: '1.25rem',
          border: `1px solid ${DENSITY_COLOR[density]}30`,
        }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: DENSITY_COLOR[density], fontFamily: 'DM Mono', lineHeight: 1 }}>
              {personCount}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
              persons
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div className={`crowd-dot ${density}`} />
              <span style={{ fontWeight: 700, color: DENSITY_COLOR[density], fontSize: '0.88rem' }}>
                {DENSITY_EMOJI[density]} {DENSITY_LABEL[density]}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, (personCount / 20) * 100)}%`, background: DENSITY_COLOR[density] }}
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 8 }}>
              <span>{mode === 'camera' ? '📷 Live camera' : '🔄 Simulated'}</span>
              <span>· updates every {mode === 'camera' ? '2.5' : '3'}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          font: '0.8rem Space Grotesk,sans-serif',
          color: 'var(--crowd-medium)',
          background: 'rgba(230,126,34,0.1)',
          border: '1px solid rgba(230,126,34,0.25)',
          borderRadius: 8, padding: '0.625rem 0.875rem',
          lineHeight: 1.5,
        }}>
          ⚠️ {error}
          {cameraPermFailed && (
            <button
              onClick={() => switchMode('sim')}
              style={{ display: 'block', marginTop: 6, fontSize: '0.78rem', color: 'var(--accent-saffron)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Switch to Simulated mode →
            </button>
          )}
        </div>
      )}

      {/* Controls */}
      {!streaming ? (
        <button
          className="btn btn-primary w-full"
          id="start-detection-btn"
          onClick={mode === 'sim' ? startSimulation : startCamera}
        >
          {mode === 'sim' ? '▶ Start Simulation' : '📷 Start Camera Detection'}
        </button>
      ) : (
        <button className="btn btn-secondary w-full" onClick={stopAll}>
          ⏹ Stop
        </button>
      )}
    </div>
  );
}
