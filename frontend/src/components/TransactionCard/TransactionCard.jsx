
import "./TransactionCard.css";

/**
 * TransactionCard
 *
 * Props:
 *   transaction  { _id, title, date, category, method, amount, type }
 *   onEdit(transaction)  — opens edit modal
 *   onDelete(_id)        — triggers delete flow
 *   deleting (bool)      — disables delete button + shows spinner text
 */
export default function TransactionCard({ transaction, onEdit, onDelete, deleting }) {
  const { _id, title, date, category, method, amount, type } = transaction;

  const isIncome = type === "income" || type === "loan";

  // "2026-02-14" → "2026 - 02 - 14"
  const displayDate = date ? String(date).replace(/-/g, " - ") : "—";

  // "+₦45,000" or "−₦28,000"
  const displayAmount = `${isIncome ? "+" : "−"}₦${Number(amount).toLocaleString()}`;

  return (
    <div className="txn-card">
      <div className="txn-card__body">

        {/* ── Left: description + meta ── */}
        <div className="txn-card__info">
          <p className="txn-card__title">{title}</p>
          <div className="txn-card__meta">
            <span className="txn-card__date">{displayDate}</span>
            {category && <span className="txn-card__badge">{category}</span>}
            {method   && <span className="txn-card__method">{method}</span>}
          </div>
        </div>

        {/* ── Right: amount + actions ── */}
        <div className="txn-card__right">
          <span className={`txn-card__amount ${isIncome ? "txn-card__amount--income" : "txn-card__amount--expense"}`}>
            {displayAmount}
          </span>

          <div className="txn-card__actions">
            <button
              className="txn-card__btn txn-card__btn--edit"
              onClick={() => onEdit(transaction)}
              aria-label="Edit transaction"
            >
              Edit
            </button>
            <button
              className="txn-card__btn txn-card__btn--delete"
              onClick={() => onDelete(_id)}
              disabled={deleting}
              aria-label="Delete transaction"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
