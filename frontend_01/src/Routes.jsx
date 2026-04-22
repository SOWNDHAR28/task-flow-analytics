import { Routes, Route, Navigate } from 'react-router-dom';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks     from './pages/Tasks';
import Reports   from './pages/Reports';
import Profile   from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar    from './components/Navbar';
import { useAuth } from './context/AuthContext';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main
        className="flex-1 p-8 min-h-screen"
        style={{ marginLeft: '16rem', background: 'var(--gradient-surface)' }}
      >
        {children}
      </main>
    </div>
  );
}

export default function AppRoutes() {
  const { loggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Login />} />
      <Route path="/" element={<Navigate to={loggedIn ? '/dashboard' : '/login'} replace />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute><AppLayout><Tasks /></AppLayout></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
