import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as taskService from "../services/taskService";
import Loader from "../components/Loader";
import { formatDate, getStatusBadgeClass } from "../utils/formatDate";
import { useAuth } from "../context/AuthContext";

/* ── Theme-aware chart tooltip ────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          style={{ color: p.stroke }}
          className="font-semibold capitalize"
        >
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Stat card ────────────────────────────────────────── */
function StatCard({ title, value, icon, accentVar, sub }) {
  return (
    <div className="stat-card">
      {/* glow blob */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: `rgb(var(${accentVar}))` }}
      />
      <div className="flex items-center justify-between relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `rgb(var(${accentVar}) / 0.18)` }}
        >
          {icon}
        </div>
        {sub !== undefined && (
          <span className="text-xs font-medium text-muted">{sub}</span>
        )}
      </div>
      <div className="relative">
        <p className="text-sm font-medium text-secondary">{title}</p>
        <p className="text-3xl font-bold text-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    taskService
      .getAllTasks()
      .then((data) =>
        setTasks(Array.isArray(data) ? data : data?.results || []),
      )
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  /* ── Derived stats ────────────────────────────────────── */
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const partial = tasks.filter((t) => t.status === "partial").length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const recent = [...tasks]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  /* ── Real chart data derived from tasks ──────────────────
     Builds last-7-days data using task created_at / updated_at.
     Completed tasks: resolved on updated_at (or created_at).
     Pending tasks:   created on created_at.
     No more DUMMY_CHART — this reflects actual API data.
  ──────────────────────────────────────────────────────── */
  const chartData = useMemo(() => {
    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return Array.from({ length: 7 }, (_, offset) => {
      const target = new Date();
      target.setDate(target.getDate() - (6 - offset));
      target.setHours(0, 0, 0, 0);
      const targetStr = target.toDateString();

      const dayCompleted = tasks.filter((t) => {
        if (t.status !== "completed") return false;
        const d = new Date(t.updated_at || t.created_at);
        return d.toDateString() === targetStr;
      }).length;

      const dayPending = tasks.filter((t) => {
        const d = new Date(t.created_at);
        return d.toDateString() === targetStr;
      }).length;

      return {
        day: DAY_LABELS[target.getDay()],
        completed: dayCompleted,
        pending: dayPending,
      };
    });
  }, [tasks]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Morning";
    if (h < 17) return "Afternoon";
    return "Evening";
  })();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">
          Good {greeting},{" "}
          <span className="text-gradient">
            {user?.name?.split(" ")[0] || "there"} 👋
          </span>
        </h1>
        <p className="page-subtitle">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {loading ? (
        <Loader text="Loading dashboard..." />
      ) : (
        <>
          {/* ── Stat cards ────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Tasks"
              value={total}
              accentVar="--brand-500"
              sub="All time"
              icon={
                <svg
                  className="w-5 h-5"
                  style={{ color: "rgb(var(--brand-400))" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            />
            <StatCard
              title="Completed"
              value={completed}
              accentVar="--status-success"
              sub="Done"
              icon={
                <svg
                  className="w-5 h-5"
                  style={{ color: "rgb(var(--status-success))" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Pending"
              value={pending}
              accentVar="--status-danger"
              sub="Active"
              icon={
                <svg
                  className="w-5 h-5"
                  style={{ color: "rgb(var(--status-danger))" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Completion Rate"
              value={`${rate}%`}
              accentVar="--brand-400"
              sub={rate >= 70 ? "🎯 Great" : "📈 Keep going"}
              icon={
                <svg
                  className="w-5 h-5"
                  style={{ color: "rgb(var(--brand-300))" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
            />
          </div>

          {/* ── Chart + Score ─────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Area chart — real task data */}
            <div className="xl:col-span-2 card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="card-title">Task Activity</h2>
                  <p className="card-subtitle">
                    Last 7 days — live from your tasks
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-secondary">
                    <span
                      className="w-3 h-0.5 rounded inline-block"
                      style={{ background: "var(--chart-completed)" }}
                    />
                    Completed
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-secondary">
                    <span
                      className="w-3 h-0.5 rounded inline-block"
                      style={{ background: "var(--chart-pending)" }}
                    />
                    Created
                  </span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient
                      id="gradCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--chart-completed)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-completed)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradPending"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--chart-pending)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-pending)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="var(--chart-completed)"
                    strokeWidth={2.5}
                    fill="url(#gradCompleted)"
                    dot={{
                      fill: "var(--chart-completed)",
                      r: 4,
                      strokeWidth: 0,
                    }}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="var(--chart-pending)"
                    strokeWidth={2.5}
                    fill="url(#gradPending)"
                    dot={{ fill: "var(--chart-pending)", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Productivity ring */}
            <div className="card">
              <h2 className="card-title mb-1">Productivity Score</h2>
              <p className="card-subtitle mb-6">
                Based on your completion rate
              </p>

              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-32 h-32">
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
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#ringGrad)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - rate / 100)}`}
                      className="transition-all duration-700"
                    />
                    <defs>
                      <linearGradient
                        id="ringGrad"
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
                    <span className="text-3xl font-bold text-primary">
                      {rate}
                    </span>
                    <span className="text-muted text-xs">/ 100</span>
                  </div>
                </div>

                <p className="text-secondary text-sm mt-4 text-center">
                  {rate >= 80
                    ? "🏆 Excellent work!"
                    : rate >= 60
                      ? "✅ Good progress"
                      : rate >= 40
                        ? "📈 Keep pushing"
                        : "🔥 Just getting started"}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  {
                    label: "Completed",
                    val: completed,
                    color: "var(--status-success)",
                  },
                  {
                    label: "Pending",
                    val: pending,
                    color: "var(--status-danger)",
                  },
                  {
                    label: "Partial",
                    val: partial,
                    color: "var(--status-warning)",
                  },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-secondary flex-1">{label}</span>
                    <span className="font-medium text-primary">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent tasks table ───────────────────────── */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="card-title">Recent Tasks</h2>
                <p className="card-subtitle">Latest 5 tasks</p>
              </div>
              <Link
                to="/tasks"
                className="text-sm font-medium transition-colors"
                style={{ color: "rgb(var(--brand-400))" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgb(var(--brand-300))")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgb(var(--brand-400))")
                }
              >
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-secondary">
                  No tasks yet.{" "}
                  <Link
                    to="/tasks"
                    style={{ color: "rgb(var(--brand-400))" }}
                    className="hover:underline"
                  >
                    Add one →
                  </Link>
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgb(var(--surface-border))",
                      }}
                    >
                      {["Title", "Status", "Due Date", "Remarks"].map((h) => (
                        <th
                          key={h}
                          className="text-left pb-3 pr-4 font-medium text-muted"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((t) => (
                      <tr key={t.id} className="table-row">
                        <td className="py-3 pr-4 font-medium text-primary max-w-[200px] truncate">
                          {t.title}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={getStatusBadgeClass(t.status)}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-secondary">
                          {formatDate(t.due_date)}
                        </td>
                        <td className="py-3 text-muted max-w-[150px] truncate">
                          {t.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
