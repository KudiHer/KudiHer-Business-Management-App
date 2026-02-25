
import { useState, useEffect, useMemo } from "react";
import TransactionCard from "../../components/TransactionCard/TransactionCard";
import {
  getTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
} from "../../services/TransactionService";
import "./Transactions.css";

// ── Default empty form ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title:    "",
  amount:   "",
  type:     "income",
  category: "",
  method:   "Cash",
  date:     new Date().toISOString().slice(0, 10),
};

const FILTER_OPTIONS = ["All", "income", "expense", "loan"];

// =============================================================================
// SkeletonCard — shimmer placeholder while loading
// =============================================================================
function SkeletonCard() {
  return (
    <div className="txn-skeleton">
      <div className="txn-skeleton__line txn-skeleton__line--title" />
      <div className="txn-skeleton__line txn-skeleton__line--meta"  />
    </div>
  );
}

// =============================================================================
// TransactionModal — handles both Create and Edit in one component
// =============================================================================
function TransactionModal({ initial, onClose, onSave }) {
  const [form,   setForm]   = useState(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  // If `initial` has an _id it's an edit; otherwise it's a create
  const isEditing = !!initial?._id;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())               { setError("Description is required.");  return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Enter a valid amount."); return; }

    setSaving(true);
    setError(null);

    try {
      const payload = { ...form, amount: Number(form.amount) };
      const saved   = isEditing
        ? await editTransaction(initial._id, payload)
        : await addTransaction(payload);

      onSave(saved, isEditing);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Clicking the dark backdrop closes the modal
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="modal">

        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__title">
            {isEditing
              ? "Edit Transaction"
              : form.type === "income"  ? "New Income"
              : form.type === "expense" ? "New Expense"
              : "Record Loan"}
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="modal__error">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="modal__form" noValidate>

          {/* Type selector — shown only on create so type stays fixed on edit */}
          {!isEditing && (
            <div className="modal__field">
              <span className="modal__label">Type</span>
              <div className="modal__type-row">
                {["income", "expense", "loan"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`modal__type-btn modal__type-btn--${t}${form.type === t ? " modal__type-btn--active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, type: t }))}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="modal__field">
            <label className="modal__label" htmlFor="txn-title">Description</label>
            <input
              id="txn-title"
              name="title"
              className="modal__input"
              placeholder="e.g. Customer purchase – Rice (50kg)"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          {/* Amount + Date */}
          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="txn-amount">Amount (₦)</label>
              <input
                id="txn-amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                className="modal__input"
                placeholder="0"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="modal__field">
              <label className="modal__label" htmlFor="txn-date">Date</label>
              <input
                id="txn-date"
                name="date"
                type="date"
                className="modal__input"
                value={form.date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category + Method */}
          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="txn-category">Category</label>
              <input
                id="txn-category"
                name="category"
                className="modal__input"
                placeholder="e.g. Sales, Utilities…"
                value={form.category}
                onChange={handleChange}
              />
            </div>
            <div className="modal__field">
              <label className="modal__label" htmlFor="txn-method">Payment method</label>
              <select
                id="txn-method"
                name="method"
                className="modal__input modal__select"
                value={form.method}
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
                <option value="POS">POS</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="modal__footer">
            <button type="button" className="modal__cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`modal__submit modal__submit--${form.type}`}
              disabled={saving}
            >
              {saving
                ? <span className="modal__spinner" />
                : isEditing ? "Save changes" : `Add ${form.type}`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// =============================================================================
// Transactions Page
// =============================================================================
export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);

  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // modal: null = closed | { initial: object }
  const [modal, setModal] = useState(null);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransactions(); // GET /api/transactions
        if (!cancelled) setTransactions(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load transactions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Client-side filter + sort ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return [...transactions]
      .filter((t) => typeFilter === "All" || t.type === typeFilter)
      .filter((t) =>
        !q ||
        (t.title    ?? "").toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q) ||
        (t.method   ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.date ?? b.createdAt) - new Date(a.date ?? a.createdAt));
  }, [transactions, search, typeFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openNew  = (type) => setModal({ initial: { ...EMPTY_FORM, type } });
  const openEdit = (tx)   => setModal({ initial: { ...tx, amount: String(tx.amount) } });
  const closeModal = ()   => setModal(null);

  /** Merge server response into state — no extra fetch needed */
  const handleSave = (saved, isEditing) => {
    setTransactions((prev) =>
      isEditing
        ? prev.map((t) => (t._id === saved._id ? saved : t))
        : [saved, ...prev]
    );
    closeModal();
  };

  /** DELETE /api/transactions/:id */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await removeTransaction(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message || "Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="txn-page">

      {/* ── Header ── */}
      <div className="txn-page__header">
        <div className="txn-page__title-block">
          <h1 className="txn-page__title">Transactions</h1>
          <p className="txn-page__subtitle">Track every Naira in and out of your business</p>
        </div>

        <div className="txn-page__actions">
          <button
            className="txn-page__btn txn-page__btn--income"
            onClick={() => openNew("income")}
          >
            + Income
          </button>
          <button
            className="txn-page__btn txn-page__btn--expense"
            onClick={() => openNew("expense")}
          >
            + Expense
          </button>
        </div>
      </div>

      {/* ── Search + filter ── */}
      <div className="txn-page__toolbar">
        <div className="txn-page__search-wrap">
          <svg className="txn-page__search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="#bbb" strokeWidth="1.8"/>
            <path d="M13.5 13.5L17 17" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            className="txn-page__search"
            type="search"
            placeholder="Search transactions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search transactions"
          />
        </div>

        <select
          className="txn-page__filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by type"
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="txn-page__list">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="txn-page__error">
          <p>⚠ {error}</p>
          <button className="txn-page__retry" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="txn-page__empty">
          {search || typeFilter !== "All"
            ? "No transactions match your search or filter."
            : "No transactions yet — hit + Income or + Expense to get started!"}
        </div>
      )}

      {/* ── List ── */}
      {!loading && !error && filtered.length > 0 && (
        <ul className="txn-page__list">
          {filtered.map((tx) => (
            <li key={tx._id} className="txn-page__list-item">
              <TransactionCard
                transaction={tx}
                onEdit={openEdit}
                onDelete={handleDelete}
                deleting={deletingId === tx._id}
              />
            </li>
          ))}
        </ul>
      )}

      {/* ── Modal ── */}
      {modal && (
        <TransactionModal
          initial={modal.initial}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

    </div>
  );
}
