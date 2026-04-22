import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getWeeklyReport, getMonthlyReport } from '../services/reportService';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

/* ── Theme-aware tooltip ───────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }} className="font-semibold capitalize">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

function SummaryCard({ label, value, icon }) {
  return (
    <div className="card text-center">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="text-secondary text-sm mt-1">{label}</p>
    </div>
  );
}

export default function Reports() {
  const [period,  setPeriod]  = useState('weekly');
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = period === 'weekly'
          ? await getWeeklyReport()
          : await getMonthlyReport();
        setReport(res);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const totalTasks      = report?.total_tasks      || 0;
  const completedTasks  = report?.completed_tasks  || 0;
  const completionRate  = report?.completion_rate  || 0;

  const chartData = period === 'weekly'
    ? (report?.daily?.map((d) => ({
        label: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
        total: d.total,
        completed: d.completed,
      })) || [])
    : (report?.weekly?.map((w, i) => ({
        label: `Week ${i + 1}`,
        total: w.total,
        completed: w.completed,
      })) || []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Track your performance over time</p>
        </div>

        {/* Period toggle */}
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'rgb(var(--surface-hover))', border: '1px solid rgb(var(--surface-border))' }}>
          {['weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={period === p
                ? { background: 'var(--gradient-brand)', color: '#fff', boxShadow: 'var(--shadow-glow)' }
                : { color: 'rgb(var(--text-secondary))' }
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
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <SummaryCard label="Total Tasks"   value={totalTasks}      icon="📋" />
            <SummaryCard label="Completed"     value={completedTasks}  icon="✅" />
            <SummaryCard label="Completion %"  value={`${completionRate}%`} icon="🎯" />
          </div>

          {/* Bar chart */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="card-title">Performance Overview</h2>
                <p className="card-subtitle capitalize">{period} breakdown</p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-xs text-secondary">
                  <span className="w-3 h-3 rounded-sm inline-block"
                    style={{ background: 'var(--chart-completed)' }} />
                  Total
                </span>
                <span className="flex items-center gap-1.5 text-xs text-secondary">
                  <span className="w-3 h-3 rounded-sm inline-block"
                    style={{ background: 'var(--status-success)' }} />
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
                <BarChart data={chartData} barCategoryGap="35%" barGap={6}
                  margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'rgb(var(--surface-hover) / 0.6)' }}
                  />
                  <Bar dataKey="total"     fill="var(--chart-completed)"   radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="completed" fill="var(--status-success)" radius={[6, 6, 0, 0]} maxBarSize={32}
                    style={{ fill: 'rgb(var(--status-success))' }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Completion rate ring */}
          {totalTasks > 0 && (
            <div className="card max-w-sm mx-auto text-center">
              <h2 className="card-title mb-1">Overall Rate</h2>
              <p className="card-subtitle mb-6">This {period === 'weekly' ? 'week' : 'month'}</p>
              <div className="flex justify-center">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="rotate-[-90deg] w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke="rgb(var(--surface-border))" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke="url(#rateGrad)" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                      className="transition-all duration-700"
                    />
                    <defs>
                      <linearGradient id="rateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="rgb(var(--brand-500))" />
                        <stop offset="100%" stopColor="rgb(var(--brand-300))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
