import { useState, useEffect } from "react";
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
//import taskService from "../services/taskService";
import Loader from "../components/Loader";
import { formatDate, getStatusBadgeClass } from "../utils/formatDate";
import { useAuth } from "../context/AuthContext";

const DUMMY_CHART = [
  { day: "Mon", completed: 3, pending: 5 },
  { day: "Tue", completed: 5, pending: 4 },
  { day: "Wed", completed: 4, pending: 6 },
  { day: "Thu", completed: 7, pending: 3 },
  { day: "Fri", completed: 6, pending: 4 },
  { day: "Sat", completed: 8, pending: 2 },
  { day: "Sun", completed: 5, pending: 3 },
];

function StatCard({ title, value, icon, color }) {
  return (
    <div className="card p-4 flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}
        >
          {icon}
        </div>

        <p className="text-gray-400 text-sm font-medium">{title}</p>
      </div>

      {/* RIGHT SIDE */}
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-card text-xs">
        <p className="text-gray-400 mb-1.5 font-medium">{label}</p>
        {payload.map((p) => (
          <p
            key={p.name}
            style={{ color: p.color }}
            className="font-semibold capitalize"
          >
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    taskService
      .getAllTasks()
      .then((data) => setTasks(Array.isArray(data) ? data : data.results || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const recent = [...tasks]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good{" "}
          {new Date().getHours() < 12
            ? "Morning"
            : new Date().getHours() < 17
              ? "Afternoon"
              : "Evening"}
          ,{" "}
          <span className="text-gradient">
            {user?.name?.split(" ")[0] || "there"} 👋
          </span>
        </h1>
        <p className="text-gray-400 mt-1">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {loading ? (
        <Loader text="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
            <StatCard
              title="Total Tasks"
              value={total}
              color="bg-brand-500"
              icon={
                <svg
                  className="w-5 h-5 text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                  />
                </svg>
              }
            />

            <StatCard
              title="Completed Tasks"
              value={completed}
              color="bg-emerald-500"
              icon={
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4"
                  />
                </svg>
              }
            />

            <StatCard
              title="Pending Tasks"
              value={pending}
              color="bg-red-500"
              icon={
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3"
                  />
                </svg>
              }
            />

            <StatCard
              title="Completion Rate"
              value={`${rate}%`}
              color="bg-violet-500"
              icon={
                <svg
                  className="w-5 h-5 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8"
                  />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2 card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-semibold">Task Activity</h2>
                  <p className="text-gray-500 text-sm">Weekly overview</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={DUMMY_CHART}
                  margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient
                      id="colorCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorPending"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a2d3e"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#colorCompleted)"
                    dot={{ fill: "#6366f1", r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#f87171"
                    strokeWidth={2.5}
                    fill="url(#colorPending)"
                    dot={{ fill: "#f87171", r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-3 h-0.5 rounded bg-brand-500 inline-block" />
                  Completed
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-3 h-0.5 rounded bg-red-400 inline-block" />
                  Pending
                </span>
              </div>
            </div>
            {/*productivity score*/}
            <div className="card">
              <h2 className="text-white font-semibold mb-1">
                Productivity Score
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Based on your completion rate
              </p>

              {/* MAIN LAYOUT */}
              <div className="flex items-center">
                {/* LEFT → 60% */}
                <div className="w-3/5 flex flex-col items-center justify-center">
                  {/* BIGGER CIRCLE */}
                  <div className="relative w-44 h-44">
                    <svg
                      viewBox="0 0 100 100"
                      className="rotate-[-90deg] w-full h-full"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#2a2d3e"
                        strokeWidth="10"
                      />

                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#scoreGrad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - rate / 100)}`}
                        className="transition-all duration-700"
                      />

                      <defs>
                        <linearGradient
                          id="scoreGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* CENTER TEXT */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {rate}
                      </span>
                      <span className="text-gray-500 text-sm">/100</span>
                    </div>
                  </div>

                  {/* MESSAGE BELOW */}
                  <p className="text-gray-400 text-sm mt-4 text-center">
                    {rate >= 80
                      ? "🏆 Excellent work!"
                      : rate >= 60
                        ? "✅ Good progress"
                        : rate >= 40
                          ? "📈 Keep pushing"
                          : "🔥 Just getting started"}
                  </p>
                </div>

                {/* RIGHT → 40% */}
                <div className="w-1/3 space-y-4">
                  {[
                    {
                      label: "Completed",
                      val: completed,
                      color: "bg-emerald-500",
                    },
                    { label: "Pending", val: pending, color: "bg-red-500" },
                    {
                      label: "Partial",
                      val: total - completed - pending,
                      color: "bg-amber-500",
                    },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex items-baseline text-sm">
                      {/* LEFT TEXT */}
                      <div className="flex items-center gap-4 text-gray-400">
                        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span>{label}</span>
                      </div>

                      {/* RIGHT VALUE (tight alignment) */}
                      <span className="ml-auto text-white font-semibold">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/*productivity score*/}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold">Recent Tasks</h2>
                <p className="text-gray-500 text-sm">Latest 5 tasks</p>
              </div>
              <Link
                to="/tasks"
                className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
              >
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  No tasks yet.{" "}
                  <Link to="/tasks" className="text-brand-400 hover:underline">
                    Add one →
                  </Link>
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {["Title", "Status", "Due Date", "Remarks"].map((h) => (
                        <th
                          key={h}
                          className="text-left text-gray-500 font-medium pb-3 pr-4"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((t) => (
                      <tr key={t.id} className="table-row">
                        <td className="py-3 pr-4 text-white font-medium max-w-[200px] truncate">
                          {t.title}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={getStatusBadgeClass(t.status)}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {formatDate(t.due_date)}
                        </td>
                        <td className="py-3 text-gray-500 max-w-[150px] truncate">
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
