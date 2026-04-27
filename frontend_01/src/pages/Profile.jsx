import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as taskService from "../services/taskService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

function InfoRow({ label, value, icon }) {
  return (
    <div
      className="flex items-center justify-between py-4"
      style={{ borderBottom: "1px solid rgb(var(--surface-border))" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary"
          style={{ background: "rgb(var(--surface-hover))" }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="font-medium mt-0.5 text-primary">{value || "—"}</p>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div
      className="text-center p-4 rounded-xl"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-secondary mt-1">{label}</p>
    </div>
  );
}

export default function Profile() {
  const { user, handleLogout, updateUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    taskService
      .getAllTasks()
      .then((data) =>
        setTasks(Array.isArray(data) ? data : data?.results || []),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const partial = tasks.filter((t) => t.status === "partial").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const score = total ? Math.round((completed / total) * 100) : 0;

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      updateUser({ name: name.trim() });
      toast.success("Profile updated");
      setEditing(false);
      setSaving(false);
    }, 500);
  };

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">
          Your account information and productivity stats
        </p>
      </div>

      {/* Avatar + name */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-glow flex-shrink-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Name edit */}
          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="space-y-3">
                <input
                  className="input-field max-w-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                />
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="btn-primary text-sm"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(user?.name || "");
                    }}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-xl font-bold text-primary">
                    {user?.name || "User"}
                  </h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-muted hover:text-secondary transition-colors"
                    title="Edit name"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-secondary text-sm mt-1">{user?.email}</p>
                <p className="text-xs text-muted mt-1">
                  Member since {joinDate}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="mt-6">
          <InfoRow
            label="Email"
            value={user?.email}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <InfoRow
            label="Full Name"
            value={user?.name}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          />
          <div className="py-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary"
                style={{ background: "rgb(var(--surface-hover))" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Member Since</p>
                <p className="font-medium mt-0.5 text-primary">{joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity stats */}
      <div className="card mb-6">
        <h2 className="card-title mb-5">Productivity Stats</h2>

        {loading ? (
          <Loader size="sm" text="Loading stats..." />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatBadge
                label="Total"
                value={total}
                color="rgb(var(--brand-400))"
              />
              <StatBadge
                label="Completed"
                value={completed}
                color="rgb(var(--status-success))"
              />
              <StatBadge
                label="Partial"
                value={partial}
                color="rgb(var(--status-warning))"
              />
              <StatBadge
                label="Pending"
                value={pending}
                color="rgb(var(--status-danger))"
              />
            </div>

            {/* Score ring */}
            <div
              className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl"
              style={{ background: "rgb(var(--surface-hover))" }}
            >
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg
                  viewBox="0 0 100 100"
                  className="rotate-[-90deg] w-full h-full"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgb(var(--surface-border))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#profileGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient
                      id="profileGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgb(var(--brand-500))" />
                      <stop offset="100%" stopColor="rgb(var(--brand-300))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {score}
                  </span>
                  <span className="text-muted text-xs">score</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-primary text-lg">
                  {score >= 80
                    ? "🏆 Outstanding!"
                    : score >= 60
                      ? "✅ Good Progress"
                      : score >= 40
                        ? "📈 Building Momentum"
                        : "🔥 Just Getting Started"}
                </p>
                <p className="text-secondary text-sm mt-1">
                  Your productivity score is based on completed and partial
                  tasks relative to total. Completed = 1pt, Partial = 0.5pt.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Danger zone */}
      <div
        className="card"
        style={{ borderColor: "rgb(var(--status-danger) / 0.3)" }}
      >
        {/* <h2 className="card-title mb-1" style={{ color: 'rgb(var(--status-danger))' }}>
          Danger Zone
        </h2>
        <p className="text-secondary text-sm mb-4">
          Actions here are permanent and cannot be undone.
        </p> */}
        <button onClick={handleLogout} className="btn-danger">
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}
