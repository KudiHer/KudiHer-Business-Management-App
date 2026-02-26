import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import "./Profitability.css";

const LINE_DATA = [
  { month: "Sept", income: 85000, expenses: 42000 },
  { month: "Oct", income: 92000, expenses: 51000 },
  { month: "Nov", income: 78000, expenses: 65000 },
  { month: "Dec", income: 110000, expenses: 48000 },
  { month: "Jan", income: 105000, expenses: 55000 },
  { month: "Feb", income: 120500, expenses: 43000 },
  { month: "Mar", income: 128000, expenses: 46000 },
];

const BAR_DATA = [
  { category: "Grains", revenue: 72000 },
  { category: "Cereals", revenue: 98000 },
  { category: "Snacks", revenue: 67000 },
  { category: "Beverages", revenue: 55000 },
];

const formatK = (v) => `₦${(v / 1000).toFixed(0)}k`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="prof-tooltip">
        <p className="prof-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: "2px 0", fontSize: 12 }}>
            {p.name}: ₦{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Profitability() {
  const latest = LINE_DATA[LINE_DATA.length - 1];
  const prev = LINE_DATA[LINE_DATA.length - 2];
  const totalIn = latest.income;
  const totalOut = latest.expenses;
  const grossProfit = totalIn - totalOut;
  const profitChange = (((grossProfit - (prev.income - prev.expenses)) / (prev.income - prev.expenses)) * 100).toFixed(1);

  return (
    <div className="profitability-page">
      <div className="prof-header">
        <h1 className="prof-title">Profitability</h1>
        <p className="prof-subtitle">Understand your profit at a glance</p>
      </div>

      <div className="prof-stats-row">
        <div className="prof-stat-card">
          <div className="prof-stat-top">
            <span className="prof-stat-label">Total In</span>
            <div className="prof-stat-icon" style={{ background: "#E9FBF2" }}>
              <TrendingUp size={16} color="#10B981" />
            </div>
          </div>
          <div className="prof-stat-value emerald">₦{totalIn.toLocaleString()}</div>
        </div>
        <div className="prof-stat-card">
          <div className="prof-stat-top">
            <span className="prof-stat-label">Total Out</span>
            <div className="prof-stat-icon" style={{ background: "#FEF2F2" }}>
              <TrendingDown size={16} color="#EF4444" />
            </div>
          </div>
          <div className="prof-stat-value red">₦{totalOut.toLocaleString()}</div>
        </div>
        <div className="prof-stat-card">
          <div className="prof-stat-top">
            <span className="prof-stat-label">Gross Profit</span>
            <div className="prof-stat-icon" style={{ background: "#E9FBF2" }}>
              <Activity size={16} color="#10B981" />
            </div>
          </div>
          <div className="prof-stat-value emerald">₦{grossProfit.toLocaleString()}</div>
          <div className="prof-change-badge">
            ▲ {profitChange}% vs last month
          </div>
        </div>
      </div>

      <div className="prof-chart-card">
        <h3 className="prof-chart-title">Monthly Profit Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={LINE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span style={{ fontSize: 12, color: "#6B7280" }}>{v}</span>}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#EF4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#EF4444", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              strokeDasharray="5 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="prof-chart-card">
        <h3 className="prof-chart-title">Top Revenue Categories</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={BAR_DATA} barCategoryGap="40%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
            <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
