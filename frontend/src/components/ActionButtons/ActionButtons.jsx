import { useState } from "react";
import { postAddIncome, postAddExpense, postRecordLoan } from "../../services/api";
import styles from "./ActionButtons.module.css";

// In a real app these would open modals with forms.
// Here we simulate submitting dummy payloads.
const DUMMY_INCOME  = { description: "Walk-in sale", amount: 5000,  category: "Sales" };
const DUMMY_EXPENSE = { description: "Restock items", amount: 2000,  category: "Inventory" };
const DUMMY_LOAN    = { description: "Bank loan",      amount: 50000, lender: "GTBank" };

export default function ActionButtons({ onActionComplete }) {
  const [loadingBtn, setLoadingBtn] = useState(null); // "income" | "expense" | "loan" | null
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleClick = async (label, apiFn, payload) => {
    setLoadingBtn(label);
    try {
      await apiFn(payload);
      showToast(`${label} recorded successfully!`, "success");
      onActionComplete?.(); // refresh summary cards
    } catch {
      showToast(`Failed to record ${label}. Try again.`, "error");
    } finally {
      setLoadingBtn(null);
    }
  };

  const BUTTONS = [
    {
      label: "income",
      text: "+ Add Income",
      variant: "primary",
      fn: () => handleClick("Income", postAddIncome, DUMMY_INCOME),
    },
    {
      label: "expense",
      text: "+ Add Expense",
      variant: "outline",
      fn: () => handleClick("Expense", postAddExpense, DUMMY_EXPENSE),
    },
    {
      label: "loan",
      text: "+ Record Loan",
      variant: "outline",
      fn: () => handleClick("Loan", postRecordLoan, DUMMY_LOAN),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {BUTTONS.map(({ label, text, variant, fn }) => (
          <button
            key={label}
            className={`${styles.btn} ${styles[variant]} ${loadingBtn === label.toLowerCase() ? styles.busy : ""}`}
            onClick={fn}
            disabled={!!loadingBtn}
          >
            {loadingBtn === label.toLowerCase() ? (
              <span className={styles.spinner} />
            ) : (
              text
            )}
          </button>
        ))}
      </div>

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}
    </div>
  );
}
