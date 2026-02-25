import Skeleton from "../Skeleton/Skeleton";
import { deleteTransaction } from "../../services/api";
import { useState } from "react";
import styles from "./RecentTransactions.module.css";

const formatAmount = (amount) => {
  const n = Number(amount);
  return `${n >= 0 ? "+₦" : "−₦"}${Math.abs(n).toLocaleString()}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};

function TransactionSkeleton() {
  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <Skeleton height="14px" width="60%" />
        <Skeleton height="11px" width="30%" style={{ marginTop: 6 }} />
      </div>
      <Skeleton height="16px" width="80px" />
    </li>
  );
}

export default function RecentTransactions({ transactions = [], loading = false, refetch }) {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Sort by most recent date, show latest 5
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date ?? b.createdAt) - new Date(a.date ?? a.createdAt))
    .slice(0, 5);

  // Map type → display category when category field is absent
  const displayCategory = (tx) => {
    if (tx.category) return tx.category;
    const map = { income: "Sales", expense: "Expense", loan: "Loan" };
    return map[tx.type] ?? tx.type;
  };

  // Determine income/expense sign: use tx.type, not sign of amount
  const isPositive = (tx) => tx.type === "income" || tx.type === "loan";

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteTransaction(id);
      refetch?.();
    } catch (err) {
      setDeleteError(err.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent transactions</h3>
        <a href="#" className={styles.viewAll}>View all</a>
      </div>

      {deleteError && (
        <div className={styles.errorState}>
          <p>⚠ {deleteError}</p>
        </div>
      )}

      <ul className={styles.list}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <TransactionSkeleton key={i} />)
          : recent.length === 0
          ? <li className={styles.empty}>No transactions yet. Add your first one above!</li>
          : recent.map((tx) => {
              const id = tx._id ?? tx.id;
              return (
                <li key={id} className={styles.item}>
                  <div className={styles.info}>
                    <span className={styles.desc}>{tx.description}</span>
                    <span className={styles.meta}>
                      {displayCategory(tx)}
                      {(tx.date ?? tx.createdAt) && (
                        <span className={styles.date}> · {formatDate(tx.date ?? tx.createdAt)}</span>
                      )}
                    </span>
                  </div>
                  <div className={styles.right}>
                    <span className={`${styles.amount} ${isPositive(tx) ? styles.positive : styles.negative}`}>
                      {isPositive(tx) ? "+₦" : "−₦"}{Math.abs(Number(tx.amount)).toLocaleString()}
                    </span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(id)}
                      disabled={deletingId === id}
                      title="Delete transaction"
                    >
                      {deletingId === id ? "…" : "✕"}
                    </button>
                  </div>
                </li>
              );
            })
        }
      </ul>
    </div>
  );
}
