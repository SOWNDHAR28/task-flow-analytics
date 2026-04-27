import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getWeeklyReport, getMonthlyReport } from "../services/reportService";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

/* ── KEEP YOUR ORIGINAL TOOLTIP (UNCHANGED) ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-3 text-xs shadow-lg">
        <p className="text-gray-400 mb-1">{label}</p>

        {payload.map((p) => (
          <p key={p.name} style={{ color: p.fill }}>
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ── SAME StatCard AS DASHBOARD ── */
function StatCard({ title, value, icon, accentVar, sub }) {
  return (
    <div className="stat-card">
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

export default function Reports() {
  const [period, setPeriod] = useState("weekly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res =
          period === "weekly"
            ? await getWeeklyReport()
            : await getMonthlyReport();
        setReport(res);
      } catch (err) {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const totalTasks = report?.total_tasks || 0;
  const completedTasks = report?.completed_tasks || 0;
  const completionRate = report?.completion_rate || 0;

  const chartData =
    period === "weekly"
      ? report?.daily?.map((d) => ({
          label: new Date(d.date).toLocaleDateString("en-IN", {
            weekday: "short",
          }),
          total: d.total,
          completed: d.completed,
        })) || []
      : report?.weekly?.map((w, i) => ({
          label: `Week ${i + 1}`,
          total: w.total,
          completed: w.completed,
        })) || [];

  return (
    <div className="animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Track your performance over time</p>
        </div>

        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{
            background: "rgb(var(--surface-hover))",
            border: "1px solid rgb(var(--surface-border))",
          }}
        >
          {["weekly", "monthly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={
                period === p
                  ? {
                      background: "var(--gradient-brand)",
                      color: "#fff",
                      boxShadow: "var(--shadow-glow)",
                    }
                  : { color: "rgb(var(--text-secondary))" }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading report..." />
      ) : (
        <>
          {/* 🔥 CARDS (MATCH DASHBOARD EXACTLY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Total Tasks"
              value={totalTasks}
              accentVar="--brand-500"
              sub="This period"
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                  />
                </svg>
              }
            />

            <StatCard
              title="Completed"
              value={completedTasks}
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
              title="Completion Rate"
              value={`${completionRate}%`}
              accentVar="--brand-400"
              sub={completionRate >= 70 ? "🎯 Great" : "📈 Keep going"}
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

          {/* 🔥 YOUR ORIGINAL CHART (UNCHANGED) */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="card-title">Performance Overview</h2>
                <p className="card-subtitle capitalize">{period} breakdown</p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-xs text-secondary">
                  <span
                    className="w-3 h-3 rounded-sm inline-block"
                    style={{ background: "var(--chart-completed)" }}
                  />
                  Total
                </span>
                <span className="flex items-center gap-1.5 text-xs text-secondary">
                  <span
                    className="w-3 h-3 rounded-sm inline-block"
                    style={{ background: "var(--status-success)" }}
                  />
                  Completed
                </span>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-60">
                <p className="text-muted">No data available for this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  barCategoryGap="35%"
                  barGap={6}
                  margin={{ top: 5, right: 5, bottom: 0, left: -15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
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

                  {/* ✅ IMPORTANT: NO cursor prop → removes grey hover */}
                  <Tooltip content={<ChartTooltip />} cursor={false} />

                  <Bar
                    dataKey="total"
                    fill="var(--chart-completed)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />

                  <Bar
                    dataKey="completed"
                    fill="var(--status-success)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                    style={{ fill: "rgb(var(--status-success))" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
