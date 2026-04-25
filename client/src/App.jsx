import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import JoinViewer from './pages/JoinViewer';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import DailyLog from './pages/DailyLog';
import Insights from './pages/Insights';
import TrustedCircle from './pages/TrustedCircle';
import ViewerDashboard from './pages/ViewerDashboard';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout
import BottomNav from './components/BottomNav';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'viewer' ? '/viewer' : '/dashboard'} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to={user.role === 'viewer' ? '/viewer' : '/dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/join/:inviteCode" element={<JoinViewer />} />

        {/* User routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="user"><Dashboard /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute role="user"><CalendarView /></ProtectedRoute>} />
        <Route path="/log" element={<ProtectedRoute role="user"><DailyLog /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute role="user"><Insights /></ProtectedRoute>} />
        <Route path="/circle" element={<ProtectedRoute role="user"><TrustedCircle /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute role="user"><Settings /></ProtectedRoute>} />

        {/* Viewer route */}
        <Route path="/viewer" element={<ProtectedRoute role="viewer"><ViewerDashboard /></ProtectedRoute>} />

        {/* Shared Chat route */}
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Show bottom nav only for authenticated users */}
      {user && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <div className="blob-bg blob-1" />
          <div className="blob-bg blob-2" />
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: 'Nunito, sans-serif',
                fontWeight: '600',
                borderRadius: '16px',
                background: '#FFF5F9',
                color: '#3B1F4A',
                border: '1px solid #F3E8FF',
                boxShadow: '0 4px 20px rgba(192, 132, 252, 0.2)',
              },
              success: { iconTheme: { primary: '#C084FC', secondary: '#fff' } },
              error: { iconTheme: { primary: '#FB7185', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
