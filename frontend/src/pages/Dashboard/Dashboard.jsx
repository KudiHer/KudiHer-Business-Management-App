import { useState } from "react";
// import { SideBar } from "../../components/SideBar/SideBar";
import SummaryCard from "../../components/SummaryCard/SummaryCard";
import ActionButtons from "../../components/ActionButtons/ActionButtons";
import LowStockAlert from "../../components/LowStockAlert/LowStockAlert";
import CashFlowChart from "../../components/CashFlowChart/CashFlowChart";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import Skeleton from "../../components/Skeleton/Skeleton";
import { useFetch } from "../../hooks/useFetch";
import { fetchTransactions, computeSummary } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./Dashboard.module.css";

const TABS = ["today", "week", "month"];
const TAB_LABELS = { today: "Today", week: "Week", month: "Month" };

const CARD_META = [
  { key: "totalIncome", title: "Total Income", color: "income" },
  { key: "totalExpenses", title: "Total expenses", color: "expense" },
  { key: "netProfit", title: "Net profit", color: "profit" },
];

/** Returns "Good morning / afternoon / evening" depending on local time */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [period, setPeriod] = useState("today");

  // ── Single source-of-truth fetch: GET /api/transactions ──────────────────
  // All derived data (summary cards, cash-flow chart, recent list) is computed
  // client-side from this one response so we only make one network call.
  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = useFetch(fetchTransactions, []);

  // Compute summary figures for the selected period
  const summary = transactions ? computeSummary(period, transactions) : null;
  return (
    <>
      {/* <SideBar /> */}
      <main className={styles.main}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.greetingBlock}>
            {/* Dynamic greeting + first name from the authenticated user object */}
            <h1 className={styles.greeting}>
              {getGreeting()},{" "}
              <span className={styles.userName}>
                {user?.fullName || "User"}
              </span>
            </h1>
            <p className={styles.subGreeting}>
              Here is your business overview for{" "}
              <strong>{TAB_LABELS[period].toLowerCase()}</strong>
            </p>
          </div>

          <div className={styles.headerRight}>
            {/* Period tabs */}
            <div className={styles.tabs}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tab} ${period === tab ? styles.tabActive : ""}`}
                  onClick={() => setPeriod(tab)}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className={styles.logoutBtn}
              title="Sign out"
            >
              ⎋ Logout
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className={styles.summaryRow}>
          {loading ? (
            CARD_META.map((c) => (
              <div key={c.key} className={styles.skeletonCard}>
                <Skeleton height="13px" width="50%" />
                <Skeleton height="30px" width="68%" style={{ marginTop: 10 }} />
                <Skeleton height="12px" width="44%" style={{ marginTop: 8 }} />
              </div>
            ))
          ) : error ? (
            <div className={styles.errorMsg}>
              <span>⚠ {error}</span>
              <button onClick={refetch} className={styles.retryBtn}>
                Retry
              </button>
            </div>
          ) : (
            CARD_META.map((c) => (
              <SummaryCard
                key={c.key}
                title={c.title}
                color={c.color}
                amount={`₦${summary[c.key].amount.toLocaleString()}`}
                trend={summary[c.key].trend}
                trendType={summary[c.key].trendType}
              />
            ))
          )}
        </div>

        {/* ── Action Buttons ── */}
        {/* onActionComplete re-fetches transactions so all derived views refresh */}
        <ActionButtons onActionComplete={refetch} />

        {/* ── Low Stock Alert ── */}
        <LowStockAlert />

        {/* ── Cash Flow Chart — receives period + raw transactions for computation ── */}
        <CashFlowChart
          period={period}
          transactions={transactions ?? []}
          loading={loading}
        />

        {/* ── Recent Transactions — receives raw list, sorts & slices itself ── */}
        <RecentTransactions
          transactions={transactions ?? []}
          loading={loading}
          refetch={refetch}
        />
      </main>
    </>
  );
}
