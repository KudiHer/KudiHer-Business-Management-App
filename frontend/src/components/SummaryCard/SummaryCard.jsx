import styles from "./SummaryCard.module.css";

export default function SummaryCard({ title, amount, trend, trendType, color }) {
  const arrow = trendType === "up" ? "↗" : "↙";

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <span className={styles.title}>{title}</span>
        <span className={`${styles.arrow} ${styles[trendType]}`}>{arrow}</span>
      </div>
      <div className={`${styles.amount} ${color === "profit" ? styles.profitAmount : ""}`}>
        {amount}
      </div>
      <div className={`${styles.trend} ${styles[trendType]}`}>
        <span>{trendType === "up" ? "↗" : "↙"}</span> {trend}
      </div>
    </div>
  );
}
