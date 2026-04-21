import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as taskService from "../services/taskService";
import toast from "react-hot-toast";

// ✅ Reusable Stat Card (same as Dashboard & Reports)
function StatCard({ title, value, icon, color }) {
  return (
    <div className="card px-3 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-opacity-20`}
        >
          {icon}
        </div>

        <p className="text-gray-400 text-xs font-medium truncate">{title}</p>
      </div>

      <p className="text-lg font-bold text-white shrink-0">{value}</p>
    </div>
  );
}

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
  const { user, handleLogout, updateUser } = useAuth();

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

  // 📊 Stats
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
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">
          Your account information and productivity stats
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* AVATAR */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-4xl font-bold shadow-glow">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            {/* ONLINE DOT */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-surface-card" />
          </div>

          {/* USER INFO */}
          <div className="flex-1 text-center sm:text-left">
            {/* EDIT MODE */}
            {editing ? (
              <div className="flex items-center gap-3 mb-1">
                <input
                  className="input-field py-2 text-lg font-semibold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <button onClick={handleSaveName} className="btn-primary">
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user?.name || "");
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-1 justify-center sm:justify-start">
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>

                <button
                  onClick={() => setEditing(true)}
                  className="text-gray-400 hover:text-brand-400"
                >
                  ✏️
                </button>
              </div>
            )}

            <p className="text-gray-400">{user?.email}</p>

            {/* 🔥 BADGES */}
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold 
                bg-brand-500/15 text-brand-400 border border-brand-500/25"
              >
                Active Member
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border
                ${
                  score >= 70
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : score >= 40
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                      : "bg-red-500/15 text-red-400 border-red-500/25"
                }`}
              >
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

      {/* 🔥 STATS ROW (NO WRAP) */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Total"
            value={total}
            color="bg-brand-500"
            icon={<span>📊</span>}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Completed"
            value={completed}
            color="bg-emerald-500"
            icon={<span>✔</span>}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Pending"
            value={pending}
            color="bg-red-500"
            icon={<span>⏳</span>}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Partial"
            value={partial}
            color="bg-amber-500"
            icon={<span>⚡</span>}
          />
        </div>
      </div>

      {/* SCORE */}
      <div className="card mb-6">
        <h3 className="text-white font-semibold mb-2">Productivity Score</h3>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-surface-border overflow-hidden">
            <div
              className="h-full bg-gradient-brand"
              style={{ width: `${score}%` }}
            />
          </div>

          <span className="text-white font-bold">{score}%</span>
        </div>
      </div>

      {/* DETAILS */}
      <div className="card mb-6">
        <InfoRow label="Full Name" value={user?.name} icon={<span>👤</span>} />
        <InfoRow label="Email" value={user?.email} icon={<span>📧</span>} />
        <InfoRow label="Member Since" value={joinDate} icon={<span>📅</span>} />
      </div>

      {/* LOGOUT */}
      <button onClick={handleLogout} className="w-full btn-danger">
        Logout
      </button>
    </div>
  );
}
