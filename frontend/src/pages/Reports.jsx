import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getWeeklyReport, getMonthlyReport } from "../services/reportService";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

// 🔥 Custom Tooltip ONLY
const CustomTooltip = ({ active, payload, label }) => {
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

// ✅ UPDATED SUMMARY CARD (Dashboard style)
function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="card px-3 py-3 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-opacity-20`}
        >
          {icon}
        </div>

        <p className="text-gray-400 text-xs font-medium truncate">{label}</p>
      </div>

      {/* RIGHT */}
      <p className="text-lg font-bold text-white shrink-0">{value}</p>
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState("weekly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // FETCH DATA
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
        toast.error(err.response?.data?.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // SAFE FALLBACKS
  const totalTasks = report?.total_tasks || 0;
  const completedTasks = report?.completed_tasks || 0;
  const completionRate = report?.completion_rate || 0;

  // CHART DATA
  const chartData =
    period === "weekly"
      ? report?.daily?.map((d) => ({
          label: new Date(d.date).toLocaleDateString("en-IN", {
            weekday: "short",
          }),
          total: d.total,
          completed: d.completed,
        }))
      : report?.weekly?.map((w, i) => ({
          label: `Week ${i + 1}`,
          total: w.total,
          completed: w.completed,
        })) || [];

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("weekly")}
            className={`btn ${period === "weekly" ? "btn-primary" : ""}`}
          >
            Weekly
          </button>

          <button
            onClick={() => setPeriod("monthly")}
            className={`btn ${period === "monthly" ? "btn-primary" : ""}`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* LOADER */}
      {loading ? (
        <Loader text="Loading report..." />
      ) : (
        <>
          {/* 🔥 SUMMARY (FIXED — ALWAYS ONE ROW) */}
          <div className="flex gap-3 mb-6 overflow-x-auto">
            <div className="flex-1 min-w-[160px]">
              <SummaryCard
                label="Total Tasks"
                value={totalTasks}
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
            </div>

            <div className="flex-1 min-w-[160px]">
              <SummaryCard
                label="Completed"
                value={completedTasks}
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
            </div>

            <div className="flex-1 min-w-[160px]">
              <SummaryCard
                label="Completion %"
                value={`${completionRate}%`}
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
          </div>

          {/* CHART */}
          <div className="card mb-6">
            <h2 className="mb-4">Performance</h2>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barCategoryGap="35%" barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />

                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />

                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />

                <Bar
                  dataKey="total"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />

                <Bar
                  dataKey="completed"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
