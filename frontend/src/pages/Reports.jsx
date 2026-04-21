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

// 🔥 Custom Tooltip ONLY (no default grey one)
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

function SummaryCard({ label, value }) {
  return (
    <div className="card text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-gray-400">{label}</p>
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

  // 🔥 NEW: Dynamic chart data from backend
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
          {/* SUMMARY */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <SummaryCard label="Total Tasks" value={totalTasks} />
            <SummaryCard label="Completed" value={completedTasks} />
            <SummaryCard label="Completion %" value={`${completionRate}%`} />
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

                {/* ✅ ONLY CUSTOM TOOLTIP */}
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }} // removes grey hover box
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
