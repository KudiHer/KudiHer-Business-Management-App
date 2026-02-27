// =============================================================================
// Loans.jsx
// Tracks active and completed loans for KudiHer.
// Drop into: src/pages/Loans/Loans.jsx
// =============================================================================

import { useState } from "react";
import {
  Plus,
  X,
  ChevronDown,
  Landmark,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import "./Loans.css";

// ── Dummy data ──────────────────────────────────────────────────────────────

const DUMMY_LOANS = [
  {
    id: 1,
    provider: "LAPO Microfinance",
    purpose: "Stock Expansion",
    amount: 430000,
    amountPaid: 90000,
    nextDueDate: "2026/02/20",
    status: "active",
  },
  {
    id: 2,
    provider: "Cooperative Society",
    purpose: "Shop Renovation",
    amount: 200000,
    amountPaid: 150000,
    nextDueDate: "2026/03/01",
    status: "active",
  },
  {
    id: 3,
    provider: "First Bank SME",
    purpose: "Equipment Purchase",
    amount: 500000,
    amountPaid: 500000,
    nextDueDate: null,
    status: "completed",
  },
];

const PURPOSES = [
  "Stock Expansion",
  "Shop Renovation",
  "Equipment Purchase",
  "Business Capital",
  "Staff Salary",
  "Utility Bills",
  "Other",
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function getPct(loan) {
  return Math.min(100, Math.round((loan.amountPaid / loan.amount) * 100));
}

function getRemaining(loan) {
  return Math.max(0, loan.amount - loan.amountPaid);
}

function fmt(n) {
  return `₦${n.toLocaleString()}`;
}

// ── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="loan-card skeleton-card">
      <div className="skeleton-line" style={{ width: "55%", height: 20, marginBottom: 8 }} />
      <div className="skeleton-line" style={{ width: "35%", height: 14, marginBottom: 20 }} />
      <div className="skeleton-line" style={{ width: "100%", height: 8, borderRadius: 8 }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <div className="skeleton-line" style={{ width: "38%", height: 14 }} />
        <div className="skeleton-line" style={{ width: "32%", height: 14 }} />
      </div>
    </div>
  );
}

// ── Add Loan Modal ───────────────────────────────────────────────────────────

function AddLoanModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    provider: "",
    purpose: "",
    amount: "",
    amountPaid: "",
    nextDueDate: "",
  });
  const [errors, setErrors] = useState({});

  const chg = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.provider.trim()) e.provider = "Provider name is required";
    if (!form.purpose) e.purpose = "Purpose is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (form.amountPaid !== "" && (isNaN(form.amountPaid) || Number(form.amountPaid) < 0)) e.amountPaid = "Invalid amount paid";
    if (form.amountPaid !== "" && Number(form.amountPaid) > Number(form.amount)) e.amountPaid = "Cannot exceed total amount";
    if (!form.nextDueDate) e.nextDueDate = "Due date is required";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const paid = Number(form.amountPaid) || 0;
    const total = Number(form.amount);

    onAdd({
      id: Date.now(),
      provider: form.provider.trim(),
      purpose: form.purpose,
      amount: total,
      amountPaid: paid,
      nextDueDate: form.nextDueDate.replace(/-/g, "/"),
      status: paid >= total ? "completed" : "active",
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Add New Loan</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div className="form-field">
            <label>Loan Provider</label>
            <input
              name="provider"
              value={form.provider}
              onChange={chg}
              placeholder="e.g. LAPO Microfinance"
            />
            {errors.provider && <span className="field-error">{errors.provider}</span>}
          </div>

          <div className="form-field">
            <label>Purpose</label>
            <div className="sel-wrap">
              <select name="purpose" value={form.purpose} onChange={chg}>
                <option value="" disabled>Select purpose</option>
                {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={15} className="sel-icon" />
            </div>
            {errors.purpose && <span className="field-error">{errors.purpose}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Total Amount (₦)</label>
              <input
                name="amount"
                type="number"
                min="0"
                value={form.amount}
                onChange={chg}
                placeholder="0"
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>
            <div className="form-field">
              <label>Amount Paid so far (₦)</label>
              <input
                name="amountPaid"
                type="number"
                min="0"
                value={form.amountPaid}
                onChange={chg}
                placeholder="0"
              />
              {errors.amountPaid && <span className="field-error">{errors.amountPaid}</span>}
            </div>
          </div>

          <div className="form-field">
            <label>Next Due Date</label>
            <input
              name="nextDueDate"
              type="date"
              value={form.nextDueDate}
              onChange={chg}
            />
            {errors.nextDueDate && <span className="field-error">{errors.nextDueDate}</span>}
          </div>

          {form.amount && form.amountPaid && (
            <div className="modal-preview">
              <div className="modal-preview-bar-wrap">
                <div
                  className="modal-preview-bar-fill"
                  style={{ width: `${Math.min(100, (Number(form.amountPaid) / Number(form.amount)) * 100)}%` }}
                />
              </div>
              <span className="modal-preview-pct">
                {Math.min(100, Math.round((Number(form.amountPaid) / Number(form.amount)) * 100))}% paid
              </span>
            </div>
          )}

          <button type="submit" className="btn-modal-submit">Add Loan</button>
        </form>
      </div>
    </div>
  );
}

// ── Loan Card ────────────────────────────────────────────────────────────────

function LoanCard({ loan, onDelete }) {
  const pct = getPct(loan);
  const remaining = getRemaining(loan);
  const isCompleted = loan.status === "completed";

  return (
    <div className={`loan-card ${isCompleted ? "loan-card--completed" : ""}`}>
      {/* Card header */}
      <div className="loan-card-header">
        <div className="loan-card-title-group">
          <div className="loan-card-icon">
            <Landmark size={16} color="#10B981" />
          </div>
          <div>
            <h3 className="loan-provider">{loan.provider}</h3>
            <p className="loan-purpose">{loan.purpose}</p>
          </div>
        </div>
        <div className="loan-card-right">
          <span className={`loan-badge ${isCompleted ? "loan-badge--completed" : "loan-badge--active"}`}>
            {isCompleted ? (
              <><CheckCircle2 size={12} /> Completed</>
            ) : (
              <><Clock size={12} /> Active</>
            )}
          </span>
          <button className="loan-delete-btn" onClick={() => onDelete(loan.id)} title="Remove loan">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Completed: show total amount prominently */}
      {isCompleted && (
        <div className="loan-completed-amount">{fmt(loan.amount)}</div>
      )}

      {/* Progress bar */}
      <div className="loan-progress-wrap">
        <div
          className={`loan-progress-fill ${isCompleted ? "loan-progress-fill--completed" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="loan-progress-label">{pct}% paid</div>

      {/* Footer details */}
      {!isCompleted && (
        <div className="loan-details-row">
          <span className="loan-detail">
            <TrendingUp size={13} />
            Remaining: <strong>{fmt(remaining)}</strong>
          </span>
          <span className="loan-detail">
            <CalendarDays size={13} />
            Next: <strong>{loan.nextDueDate}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

// ── Summary strip ────────────────────────────────────────────────────────────

function LoanSummary({ loans }) {
  const active = loans.filter((l) => l.status === "active");
  const totalBorrowed = loans.reduce((s, l) => s + l.amount, 0);
  const totalRemaining = loans.filter(l => l.status === "active").reduce((s, l) => s + getRemaining(l), 0);
  const totalPaid = loans.reduce((s, l) => s + l.amountPaid, 0);

  return (
    <div className="loan-summary-strip">
      <div className="loan-summary-item">
        <span className="loan-summary-label">Active Loans</span>
        <span className="loan-summary-value">{active.length}</span>
      </div>
      <div className="loan-summary-divider" />
      <div className="loan-summary-item">
        <span className="loan-summary-label">Total Borrowed</span>
        <span className="loan-summary-value">{fmt(totalBorrowed)}</span>
      </div>
      <div className="loan-summary-divider" />
      <div className="loan-summary-item">
        <span className="loan-summary-label">Total Paid</span>
        <span className="loan-summary-value emerald">{fmt(totalPaid)}</span>
      </div>
      <div className="loan-summary-divider" />
      <div className="loan-summary-item">
        <span className="loan-summary-label">Outstanding</span>
        <span className="loan-summary-value red">{fmt(totalRemaining)}</span>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Loans() {
  const [loans, setLoans] = useState(DUMMY_LOANS);
  const [showModal, setShowModal] = useState(false);
  const [loading] = useState(false); // set true to preview skeleton

  const activeLoans = loans.filter((l) => l.status === "active");
  const completedLoans = loans.filter((l) => l.status === "completed");

  const handleAdd = (loan) => {
    setLoans((prev) => [loan, ...prev]);
  };

  const handleDelete = (id) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="loans-page">

      {/* ── Page header ───────────────────────────────────── */}
      <div className="loans-header">
        <div>
          <h1 className="loans-title">Loans</h1>
          <p className="loans-subtitle">Track and manage your business loans</p>
        </div>
        <button className="btn-add-loan" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Loan
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────── */}
      {!loading && loans.length > 0 && <LoanSummary loans={loans} />}

      {/* ── Loading skeletons ─────────────────────────────── */}
      {loading && (
        <div className="loans-section">
          <p className="loans-section-label">Active Loans</p>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────── */}
      {!loading && loans.length === 0 && (
        <div className="loans-empty">
          <AlertCircle size={40} color="#D1D5DB" />
          <p className="loans-empty-title">No loans recorded yet</p>
          <p className="loans-empty-sub">Tap "+ Add Loan" to track your first business loan.</p>
          <button className="btn-add-loan" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Loan
          </button>
        </div>
      )}

      {/* ── Active loans ──────────────────────────────────── */}
      {!loading && activeLoans.length > 0 && (
        <div className="loans-section">
          <p className="loans-section-label">Active Loans</p>
          {activeLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* ── Completed loans ───────────────────────────────── */}
      {!loading && completedLoans.length > 0 && (
        <div className="loans-section">
          <p className="loans-section-label">
            Completed Loans ({completedLoans.length})
          </p>
          {completedLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* ── Add Loan modal ────────────────────────────────── */}
      {showModal && (
        <AddLoanModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
