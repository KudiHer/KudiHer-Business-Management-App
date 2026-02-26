import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import "./Cashflow.css";

const BAR_DATA = [
  { month: "Sept", income: 85000, expenses: 42000 },
  { month: "Oct", income: 92000, expenses: 51000 },
  { month: "Nov", income: 78000, expenses: 65000 },
  { month: "Dec", income: 110000, expenses: 48000 },
  { month: "Jan", income: 105000, expenses: 55000 },
  { month: "Feb", income: 120500, expenses: 43000 },
];

const PIE_DATA = [
  { name: "Restocking", value: 18000, color: "#10B981" },
  { name: "Transport", value: 8500, color: "#34D399" },
  { name: "Utilities", value: 6200, color: "#F59E0B" },
  { name: "Staff", value: 7300, color: "#EF4444" },
  { name: "Other", value: 3000, color: "#8B5CF6" },
];

const formatNaira = (v) => `₦${(v / 1000).toFixed(0)}k`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="cf-tooltip">
        <p className="cf-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: ₦{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Cashflow() {
  const latest = BAR_DATA[BAR_DATA.length - 1];
  const netFlow = latest.income - latest.expenses;
  const netPct = ((netFlow / latest.expenses) * 100).toFixed(1);

  const stats = [
    { label: "Total In", value: latest.income, icon: TrendingUp, color: "#10B981", positive: true },
    { label: "Total Out", value: latest.expenses, icon: TrendingDown, color: "#EF4444", positive: false },
    { label: "Net Flow", value: netFlow, icon: netFlow >= 0 ? TrendingUp : TrendingDown, color: netFlow >= 0 ? "#10B981" : "#EF4444", badge: `${netPct}%`, positive: netFlow >= 0 },
  ];

  return (
    <div className="cashflow-page">
      <div className="cf-header">
        <h1 className="cf-title">Cash Flow</h1>
        <p className="cf-subtitle">Monitor money coming in and going out</p>
      </div>

      <div className="cf-stats-row">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div className="cf-stat-card" key={s.label}>
              <div className="cf-stat-top">
                <span className="cf-stat-label">{s.label}</span>
                <div className="cf-stat-icon" style={{ background: s.positive ? "#E9FBF2" : "#FEF2F2" }}>
                  <Icon size={16} color={s.color} />
                </div>
              </div>
              <div className="cf-stat-value" style={{ color: s.color }}>
                ₦{s.value.toLocaleString()}
              </div>
              {s.badge && (
                <div className="cf-stat-badge" style={{ color: s.positive ? "#059669" : "#DC2626", background: s.positive ? "#D1FAE5" : "#FEE2E2" }}>
                  {s.positive ? "▲" : "▼"} {s.badge} vs last month
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="cf-chart-card">
        <h3 className="cf-chart-title">Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={BAR_DATA} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatNaira} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span style={{ fontSize: 12, color: "#6B7280" }}>{v}</span>}
            />
            <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#FCA5A5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="cf-bottom-row">
        <div className="cf-chart-card cf-pie-card">
          <h3 className="cf-chart-title">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {PIE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {PIE_DATA.map((item) => (
              <div className="pie-legend-item" key={item.name}>
                <span className="pie-dot" style={{ background: item.color }} />
                <span className="pie-name">{item.name}</span>
                <span className="pie-val">₦{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cf-chart-card cf-summary-card">
          <h3 className="cf-chart-title">Monthly Summary</h3>
          <div className="cf-summary-list">
            {BAR_DATA.slice().reverse().map((d) => {
              const net = d.income - d.expenses;
              return (
                <div className="cf-summary-row" key={d.month}>
                  <span className="cf-summary-month">{d.month}</span>
                  <div className="cf-summary-bar-wrap">
                    <div
                      className="cf-summary-bar"
                      style={{ width: `${(d.income / 130000) * 100}%` }}
                    />
                  </div>
                  <span className="cf-summary-net" style={{ color: net >= 0 ? "#10B981" : "#EF4444" }}>
                    {net >= 0 ? "+" : ""}₦{(net / 1000).toFixed(0)}k
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
