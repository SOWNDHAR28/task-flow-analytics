import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as taskService from "../services/taskService";
import { useEffect } from "react";
import toast from "react-hot-toast";

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-surface-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-hover flex items-center justify-center text-gray-400">
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-xs font-medium">{label}</p>
          <p className="text-white font-medium mt-0.5">{value || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, handleLogout , updateUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    taskService
      .getAllTasks()
      .then((data) => setTasks(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const partial = tasks.filter((t) => t.status === "partial").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const score = total
    ? Math.round(((completed + partial * 0.5) / total) * 100)
    : 0;


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
    }, 600);
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
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">
          Your account information and productivity stats
        </p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-4xl font-bold shadow-glow">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-surface-card" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="flex items-center gap-3 mb-1">
                <input
                  id="profile-name-input"
                  className="input-field py-2 text-lg font-semibold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="btn-primary py-2 px-4 whitespace-nowrap"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user?.name || "");
                  }}
                  className="btn-secondary py-2 px-3"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {user?.name || "User"}
                </h2>
                <button
                  id="edit-profile-btn"
                  onClick={() => setEditing(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-brand-400 hover:bg-brand-500/15 transition-all"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-gray-400">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-400 border border-brand-500/25">
                Active Member
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                {score >= 70
                  ? "High Performer"
                  : score >= 40
                    ? "Growing"
                    : "Getting Started"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Tasks",
            value: total,
            color: "text-brand-400",
            bg: "bg-brand-500/10",
          },
          {
            label: "Completed",
            value: completed,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Pending",
            value: pending,
            color: "text-red-400",
            bg: "bg-red-500/10",
          },
          {
            label: "Partial",
            value: partial,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`card text-center py-4 ${bg} border-transparent`}
          >
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card mb-6">
        <h3 className="text-white font-semibold mb-2">Productivity Score</h3>
        <p className="text-gray-500 text-sm mb-4">
          Weighted score: completed tasks × 1, partial × 0.5
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-surface-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-brand transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-white font-bold text-xl w-16 text-right">
            {score}%
          </span>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          {score >= 80
            ? "🏆 Outstanding! You're a productivity champion."
            : score >= 60
              ? "✅ Great work! Keep up the momentum."
              : score >= 40
                ? "📈 Good progress. Push a little harder!"
                : "🔥 Just starting out — every task counts!"}
        </p>
      </div>

      <div className="card mb-6">
        <h3 className="text-white font-semibold mb-1">Account Details</h3>
        <p className="text-gray-500 text-sm mb-4">Your profile information</p>
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
        <InfoRow
          label="Email Address"
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
          label="Member Since"
          value={joinDate}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>

      <button
        id="logout-btn"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold
          bg-red-500/10 text-red-400 border border-red-500/20
          hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-150"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Sign Out
      </button>
    </div>
  );
}
