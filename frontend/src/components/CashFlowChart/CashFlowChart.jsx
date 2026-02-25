import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { computeCashFlow } from "../../services/api";
import Skeleton from "../Skeleton/Skeleton";
import styles from "./CashFlowChart.module.css";

const PERIOD_LABELS = { today: "Today", week: "Last 7 days", month: "Last 4 weeks" };
const formatNaira   = (v) => `₦${(v / 1000).toFixed(0)}k`;

export default function CashFlowChart({ period = "week", transactions = [], loading = false }) {
  // Data is computed from the transactions prop — no independent fetch needed.
  // Dashboard already has the full transaction list; we just derive the chart series.
  const data = computeCashFlow(period, transactions);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Cash flow — {PERIOD_LABELS[period]}</h3>

      {loading ? (
        <div className={styles.skeletonChart}>
          <Skeleton height="220px" borderRadius="10px" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 13, fill: "#999" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatNaira}
              tick={{ fontSize: 12, fill: "#999" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value) => [`₦${value.toLocaleString()}`, ""]}
              contentStyle={{ borderRadius: "10px", border: "1px solid #eee", fontSize: "13px" }}
            />
            <Legend
              iconType="plainline"
              iconSize={24}
              wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#1a9e6e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#1a9e6e", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#e05252"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#e05252", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
