import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';

export default function Login() {
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    try {
      setLoading(true);
      const result = await loginService(form.email, form.password);
      handleLogin(result.data.user, result.data.token);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse-slow opacity-20"
          style={{ background: 'rgb(var(--brand-600))' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse-slow opacity-20"
          style={{ background: 'rgb(var(--brand-400))', animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 shadow-glow"
            style={{ background: 'var(--gradient-brand)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary">TaskFlow</h1>
          <p className="text-secondary mt-1">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">
                Email address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-secondary text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup"
              style={{ color: 'rgb(var(--brand-400))' }}
              className="hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-muted text-xs mt-6">
          Task Tracking &amp; Productivity Analytics System
        </p>
      </div>
    </div>
  );
}
