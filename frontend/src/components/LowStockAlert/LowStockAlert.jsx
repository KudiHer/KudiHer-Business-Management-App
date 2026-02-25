import { useFetch } from "../../hooks/useFetch";
import { fetchLowStockItems } from "../../services/api";
import Skeleton from "../Skeleton/Skeleton";
import styles from "./LowStockAlert.module.css";

export default function LowStockAlert() {
  // ── API call: fetch items below reorder threshold ──
  const { data: items, loading, error, refetch } = useFetch(fetchLowStockItems);

  if (loading) {
    return (
      <div className={styles.alert}>
        <Skeleton height="16px" width="40%" />
        <Skeleton height="14px" width="80%" style={{ marginTop: 10 }} />
        <Skeleton height="13px" width="30%" style={{ marginTop: 8 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.alert} ${styles.errorState}`}>
        <p className={styles.errorText}>⚠ Could not load stock alerts.</p>
        <button onClick={refetch} className={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className={styles.alert}>
      <div className={styles.header}>
        <span className={styles.icon}>⚠️</span>
        <span className={styles.title}>{items.length} items running low</span>
      </div>
      <p className={styles.items}>{items.map((i) => i.name).join(", ")}</p>
      <a href="#" className={styles.link}>View Inventory →</a>
    </div>
  );
}
