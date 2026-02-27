import styles from "./ActionButtons.module.css";

/** * ActionButtons Component 
 * Now purely handles navigation to dedicated form pages.
 */
export default function ActionButtons({ onAddIncome, onAddExpense, onRecordLoan }) {

  const BUTTONS = [
    {
      label: "income",
      text: "+ Add Income",
      variant: "primary",
      fn: onAddIncome,
    },
    {
      label: "expense",
      text: "+ Add Expense",
      variant: "outline",
      fn: onAddExpense,
    },
    {
      label: "loan",
      text: "+ Record Loan",
      variant: "outline",
      fn: onRecordLoan,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {BUTTONS.map(({ label, text, variant, fn }) => (
          <button
            key={label}
            className={`${styles.btn} ${styles[variant]}`}
            onClick={fn}
            type="button"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}