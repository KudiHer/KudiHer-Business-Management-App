

import { useState }       from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard        from "../../components/SummaryCard/SummaryCard";
import ActionButtons      from "../../components/ActionButtons/ActionButtons";
import LowStockAlert      from "../../components/LowStockAlert/LowStockAlert";
import CashFlowChart      from "../../components/CashFlowChart/CashFlowChart";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import Skeleton           from "../../components/Skeleton/Skeleton";
import { useFetch }       from "../../hooks/useFetch";
import { fetchTransactions, computeSummary } from "../../services/api";
import { useAuth }        from "../../context/AuthContext";
import styles             from "./Dashboard.module.css";

// ── Constants — identical to original ─────────────────────────────────────────
const TABS       = ["today", "week", "month"];
const TAB_LABELS = { today: "Today", week: "Week", month: "Month" };

const CARD_META = [
  { key: "totalIncome",   title: "Total Income",   color: "income"  },
  { key: "totalExpenses", title: "Total expenses",  color: "expense" },
  { key: "netProfit",     title: "Net profit",      color: "profit"  },
];



/** Returns "Good morning / afternoon / evening" based on local time */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// =============================================================================
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [period, setPeriod] = useState("today");

  const navigate = useNavigate();
  const handleAddIncome = () => navigate("/add-income");
const handleAddExpense = () => navigate("/add-expense");
const handleRecordLoan = () => navigate("/loans");
  // ── Single source-of-truth fetch ─────────────────────────────────────────
  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = useFetch(fetchTransactions, []);

const handleLogout = () => {
    logout();         // Clear auth state/tokens
    navigate("/");    // Redirect to WelcomePage
  };

  const summary  = transactions ? computeSummary(period, transactions) : null;
  const greeting = getGreeting();

  return (
    <main className={styles.main}>

      {/* ── Desktop header: greeting + period tabs + logout ─────────────────
          Hidden on mobile via Dashboard.module.css media query.
          On mobile the AppLayout top-bar shows the page title instead.    ── */}
      <div className={styles.header}>
        <div className={styles.greetingBlock}>
          <h1 className={styles.greeting}>
            {greeting},{" "}
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
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab}${period === tab ? ` ${styles.tabActive}` : ""}`}
                onClick={() => setPeriod(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className={styles.logoutBtn} title="Sign out">
            ⎋ Logout
          </button>
        </div>
      </div>

     
      <div className={styles.mobileSubHeader}>
        <p className={styles.subGreeting}>
          Here is your business overview for{" "}
          <strong>{TAB_LABELS[period].toLowerCase()}</strong>
        </p>
        <div className={styles.mobileTabs}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.mobileTab}${period === tab ? ` ${styles.mobileTabActive}` : ""}`}
              onClick={() => setPeriod(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
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
            <button onClick={refetch} className={styles.retryBtn}>Retry</button>
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
      <ActionButtons
      onActionComplete={refetch}
      onAddIncome={() => navigate("/add-income")}
      onAddExpense={() => navigate("/add-expense")}
      onRecordLoan={handleRecordLoan}
    />

      {/* ── Low Stock Alert ── */}
      <LowStockAlert />

      {/* ── Cash Flow Chart ── */}
      <CashFlowChart
        period={period}
        transactions={transactions ?? []}
        loading={loading}
      />

      {/* ── Recent Transactions ── */}
      <RecentTransactions
        transactions={transactions ?? []}
        loading={loading}
        refetch={refetch}
      />

    </main>
  );
}


