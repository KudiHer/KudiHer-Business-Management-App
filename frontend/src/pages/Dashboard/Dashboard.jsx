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

const TABS       = ["today", "week", "month"];
const TAB_LABELS = { today: "Today", week: "Week", month: "Month" };

const CARD_META = [
  { key: "totalIncome",   title: "Total Income",  color: "income"  },
  { key: "totalExpenses", title: "Total expenses", color: "expense" },
  { key: "netProfit",     title: "Net profit",      color: "profit"  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

async function guardedFetchTransactions() {
  if (!tokenStorage.get()) {
    throw new Error("Session expired. Please sign in again.");
  }
  return fetchTransactions();
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [period, setPeriod] = useState("today");
  const navigate = useNavigate();

  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = useFetch(guardedFetchTransactions, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const summary     = transactions ? computeSummary(period, transactions) : null;
  const greeting    = getGreeting();

  /**
   * FIX: DYNAMIC NAME LOGIC
   * Based on your design mockup, this should prioritize 'firstName' 
   * or the first part of the 'fullName'.
   * 
   */


 const displayName = user?.data?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || "User";

  return (
    /* FIX: Added a wrapper class to handle the Fixed Sidebar offset */
    <div className={styles.dashboardLayoutWrapper}>
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
                amount={`₦${summary?.[c.key]?.amount?.toLocaleString() ?? 0}`}
                trend={summary?.[c.key]?.trend}
                trendType={summary?.[c.key]?.trendType}
              />
            ))
          )}
        </div>

        <ActionButtons
          onActionComplete={refetch}
          onAddIncome={() => navigate("/add-income")}
          onAddExpense={() => navigate("/add-expense")}
          onRecordLoan={() => navigate("/loans")}
        />

        <LowStockAlert />

        <CashFlowChart
          period={period}
          transactions={transactions ?? []}
          loading={loading}
        />

        <RecentTransactions
          transactions={transactions ?? []}
          loading={loading}
          refetch={refetch}
        />

      </main>
    </div>
  );
}