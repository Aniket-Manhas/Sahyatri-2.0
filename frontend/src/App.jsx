import { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/shared/Sidebar';
import Navbar from './components/shared/Navbar';
import LoadingSpinner from './components/shared/LoadingSpinner';

// User pages
import Login      from './pages/user/Login';
import Register   from './pages/user/Register';
import Dashboard  from './pages/user/Dashboard';
import Navigation from './pages/user/Navigation';
import Emergency  from './pages/user/Emergency';
import Accessibility from './pages/user/Accessibility';
import LastMile   from './pages/user/LastMile';
import WorldMap   from './pages/user/WorldMap';

// Admin pages
import AdminLogin         from './pages/admin/AdminLogin';
import AdminDashboard     from './pages/admin/AdminDashboard';
import CrowdMonitor       from './pages/admin/CrowdMonitor';
import AlertManager       from './pages/admin/AlertManager';
import StationEditor      from './pages/admin/StationEditor';
import Analytics          from './pages/admin/Analytics';
import AdminNotifications from './pages/admin/AdminNotifications';

// Page title map
const PAGE_TITLES = {
  '/dashboard':             '🏠 Dashboard',
  '/map':                   '🌍 Live Map',
  '/navigation':            '🧭 Indoor Navigation',
  '/emergency':             '🚨 Emergency',
  '/accessibility':         '♿ Accessibility',
  '/last-mile':             '🚕 Last Mile',
  '/admin/dashboard':       '📊 Overview',
  '/admin/crowd':           '🔴 Crowd Monitor',
  '/admin/alerts':          '🚨 Alert Manager',
  '/admin/editor':          '🗺️ Station Editor',
  '/admin/analytics':       '📈 Analytics',
  '/admin/notifications':   '🔔 Notifications',
};

// ── Route Guards ─────────────────────────────────────────────

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner fullPage message="Authenticating…" />;
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner fullPage message="Authenticating…" />;
  if (!user) return <Navigate to="/admin" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function RedirectIfAuth() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return <Outlet />;
}

// ── App Layout (with sidebar + topbar) ───────────────────────

function AppLayout({ isAdmin = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Sahyatri';
  const isMapPage = location.pathname === '/map';

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={isAdmin} />
      <div className="main-content">
        <Navbar title={title} onMenuToggle={() => setSidebarOpen(p => !p)} isAdmin={isAdmin} />
        <div className={isMapPage ? '' : 'page-body'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Public: no auth */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin"    element={<AdminLogin />} />
      </Route>

      {/* User routes */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/map"          element={<WorldMap />} />
        <Route path="/navigation"   element={<Navigation />} />
        <Route path="/emergency"    element={<Emergency />} />
        <Route path="/accessibility"element={<Accessibility />} />
        <Route path="/last-mile"    element={<LastMile />} />
      </Route>

      {/* Admin routes */}
      <Route element={<RequireAdmin><AppLayout isAdmin /></RequireAdmin>}>
        <Route path="/admin/dashboard"     element={<AdminDashboard />} />
        <Route path="/admin/crowd"         element={<CrowdMonitor />} />
        <Route path="/admin/alerts"        element={<AlertManager />} />
        <Route path="/admin/editor"        element={<StationEditor />} />
        <Route path="/admin/analytics"     element={<Analytics />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
