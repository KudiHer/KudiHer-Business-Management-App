

import { useState }       from "react";
import { useNavigate }    from "react-router-dom";
import SummaryCard        from "../../components/SummaryCard/SummaryCard";
import ActionButtons      from "../../components/ActionButtons/ActionButtons";
import LowStockAlert      from "../../components/LowStockAlert/LowStockAlert";
import CashFlowChart      from "../../components/CashFlowChart/CashFlowChart";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import Skeleton           from "../../components/Skeleton/Skeleton";
import { useFetch }       from "../../hooks/useFetch";
import { fetchTransactions, computeSummary, tokenStorage } from "../../services/api";
import { useAuth }        from "../../context/AuthContext";
import styles             from "./Dashboard.module.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS       = ["today", "week", "month"];
const TAB_LABELS = { today: "Today", week: "Week", month: "Month" };

const CARD_META = [
  { key: "totalIncome",   title: "Total Income",   color: "income"  },
  { key: "totalExpenses", title: "Total expenses",  color: "expense" },
  { key: "netProfit",     title: "Net profit",      color: "profit"  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Token-guarded fetch ───────────────────────────────────────────────────────
// Throws a friendly message before hitting the network if no session exists,
// so the Dashboard error state shows something useful instead of a raw 401.
async function guardedFetchTransactions() {
  if (!tokenStorage.get()) {
    throw new Error("Session expired. Please sign in again.");
  }
  return fetchTransactions();
}

// =============================================================================
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [period, setPeriod] = useState("today");
  const navigate = useNavigate();

  // ── Data fetch ────────────────────────────────────────────────────────────
  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = useFetch(guardedFetchTransactions, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  // AuthContext.logout() calls logoutRequest() from api.js which removes
  // both "kudiher_token" and "kudiher_user" from localStorage.
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const summary     = transactions ? computeSummary(period, transactions) : null;
  const greeting    = getGreeting();

  // Backend User.js schema field is `fullName` — read that directly.
  // Fallback chain handles any edge case where the object shape differs.
  const displayName = user?.fullName ?? user?.name ?? "User";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className={styles.main}>

      {/* ── Desktop header ── */}
      <div className={styles.header}>
        <div className={styles.greetingBlock}>
          <h1 className={styles.greeting}>
            {greeting},{" "}
            <span className={styles.userName}>{displayName}</span>
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

      {/* ── Mobile sub-header (shown via CSS media query) ── */}
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
        onRecordLoan={() => navigate("/loans")}
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
