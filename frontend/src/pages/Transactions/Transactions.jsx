// =============================================================================
// src/pages/Transactions/Transactions.jsx
// =============================================================================
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TransactionCard from "../../components/TransactionCard/TransactionCard";
import {
  getTransactions,
  editTransaction,
  removeTransaction,
} from "../../services/TransactionService";
import "./Transactions.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title:    "",
  amount:   "",
  type:     "income",
  category: "",
  method:   "Cash",
  date:     new Date().toISOString().slice(0, 10),
};

const FILTER_OPTIONS = ["All", "income", "expense", "loan"];

// Helper to handle inconsistent ID naming from different API services
const getTxId = (tx) => tx._id || tx.id;

// =============================================================================
// SkeletonCard
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
// TransactionModal — Edit only
// =============================================================================
function TransactionModal({ initial, onClose, onSave }) {
  const [form,   setForm]   = useState(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim())                       { setError("Description is required.");  return; }
    if (!form.amount || Number(form.amount) <= 0)  { setError("Enter a valid amount.");     return; }

    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      // Use helper to ensure we have the correct ID for the API call
      const id = getTxId(initial);
      const saved = await editTransaction(id, payload);
      onSave(saved);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Edit Transaction</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="modal__error">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="modal__form" noValidate>
          <div className="modal__field">
            <label className="modal__label" htmlFor="edit-title">Description</label>
            <input
              id="edit-title"
              name="title"
              className="modal__input"
              placeholder="e.g. Customer purchase"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="edit-amount">Amount (₦)</label>
              <input
                id="edit-amount"
                name="amount"
                type="number"
                className="modal__input"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="modal__field">
              <label className="modal__label" htmlFor="edit-date">Date</label>
              <input
                id="edit-date"
                name="date"
                type="date"
                className="modal__input"
                value={form.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="edit-category">Category</label>
              <input
                id="edit-category"
                name="category"
                className="modal__input"
                value={form.category}
                onChange={handleChange}
              />
            </div>
            <div className="modal__field">
              <label className="modal__label" htmlFor="edit-method">Payment method</label>
              <select
                id="edit-method"
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

          <div className="modal__footer">
            <button type="button" className="modal__cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal__submit modal__submit--income" disabled={saving}>
              {saving ? <span className="modal__spinner" /> : "Save changes"}
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
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [editModal,    setEditModal]    = useState(null);

  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransactions();
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return [...transactions]
      .filter((t) => typeFilter === "All" || t.type === typeFilter)
      .filter((t) => {
        if (!q) return true;
        // Search across multiple possible fields to prevent "missing title" issues
        const textToSearch = [
          t.title, 
          t.description, 
          t.category, 
          t.method, 
          t.item
        ].join(" ").toLowerCase();
        return textToSearch.includes(q);
      })
      .sort((a, b) => new Date(b.date ?? b.createdAt) - new Date(a.date ?? a.createdAt));
  }, [transactions, search, typeFilter]);

  const handleEditSave = (saved) => {
    setTransactions((prev) => prev.map((t) => (getTxId(t) === getTxId(saved) ? saved : t)));
    setEditModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await removeTransaction(id);
      setTransactions((prev) => prev.filter((t) => getTxId(t) !== id));
    } catch (err) {
      alert(err.message || "Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="txn-page">
      <div className="txn-page__header">
        <div className="txn-page__title-block">
          <h1 className="txn-page__title">Transactions</h1>
          <p className="txn-page__subtitle">Track every Naira in and out of your business</p>
        </div>

        <div className="txn-page__actions">
          <button className="txn-page__btn txn-page__btn--income" onClick={() => navigate("/add-income")}>
            + Income
          </button>
          <button className="txn-page__btn txn-page__btn--expense" onClick={() => navigate("/add-expense")}>
            + Expense
          </button>
        </div>
      </div>

      <div className="txn-page__toolbar">
        <div className="txn-page__search-wrap">
          <svg className="txn-page__search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#bbb" strokeWidth="1.8"/>
            <path d="M13.5 13.5L17 17" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            className="txn-page__search"
            type="search"
            placeholder="Search descriptions or categories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="txn-page__filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {FILTER_OPTIONS.map((o) => (
            <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="txn-page__list">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div className="txn-page__error">
          <p>⚠ {error}</p>
          <button className="txn-page__retry" onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="txn-page__empty">
          {search || typeFilter !== "All"
            ? "No transactions match your search or filter."
            : "No transactions yet — hit + Income or + Expense to get started!"}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="txn-page__list">
          {filtered.map((tx) => {
            const id = getTxId(tx);
            return (
              <li key={id} className="txn-page__list-item">
                <TransactionCard
                  transaction={tx}
                  onEdit={(t) => setEditModal(t)}
                  onDelete={() => handleDelete(id)}
                  deleting={deletingId === id}
                />
              </li>
            );
          })}
        </ul>
      )}

      {editModal && (
        <TransactionModal
          initial={{ ...editModal, amount: String(editModal.amount) }}
          onClose={() => setEditModal(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}