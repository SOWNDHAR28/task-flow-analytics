import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginService } from "../services/authService";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { handleLogin } = useAuth(); // ✅ use this instead of login()
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // ✅ Call backend API
      const result = await loginService(form.email, form.password);

      // ✅ Store user + token in context
      handleLogin(result.data.user, result.data.token);

      toast.success("Welcome back! 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects (UNCHANGED) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">TaskFlow</h1>
          <p className="text-gray-400 mt-1">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="card border-surface-border/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Task Tracking & Productivity Analytics System
        </p>
      </div>
    </div>
  );
}
