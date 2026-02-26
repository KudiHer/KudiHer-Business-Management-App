// =============================================================================
// src/pages/AddIncome/AddIncome.jsx
// =============================================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { addTransaction } from "../../services/TransactionService";
import "./AddIncome.css";

// ── Options ───────────────────────────────────────────────────────────────────
const INCOME_CATEGORIES = [
  "Sales",
  "Wholesale Order",
  "Service Fee",
  "Loan Repayment Received",
  "Investment Return",
  "Other Income",
];

const PAYMENT_METHODS = ["Cash", "Transfer", "POS", "Cheque", "Other"];

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY = {
  amount:       "",
  category:     "",
  customerName: "",
  item:         "",
  method:       "",
  date:         new Date().toISOString().slice(0, 10),
  notes:        "",
};

// =============================================================================
export default function AddIncome() {
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ ...EMPTY });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [toastOk, setToastOk] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.amount || Number(form.amount) <= 0) return "Please enter a valid amount.";
    if (!form.category)                           return "Please select a category.";
    if (!form.method)                             return "Please select a payment method.";
    if (!form.date)                               return "Please select a date.";
    return null;
  };

  const buildPayload = () => ({
    type:         "income",
    amount:       Number(form.amount),
    category:     form.category,
    title:        form.item || form.customerName || "Income",
    customerName: form.customerName,
    item:         form.item,
    method:       form.method,
    date:         form.date,
    notes:        form.notes,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    try {
      await addTransaction(buildPayload());
      navigate("/transactions");
    } catch (err) {
      setError(err.message || "Failed to save income. Please try again.");
      setSaving(false);
    }
  };

  const handleSaveAndAnother = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    try {
      await addTransaction(buildPayload());
      setForm({ ...EMPTY, date: new Date().toISOString().slice(0, 10) });
      setToastOk(true);
      setTimeout(() => setToastOk(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save income. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-income-page">
      <div className="add-income-page__inner">

        <button
          type="button"
          className="add-income-page__back"
          onClick={() => navigate("/transactions")}
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Transactions
        </button>

        <h1 className="add-income-page__heading">Add Income</h1>
        <p className="add-income-page__subheading">Record money coming into your business</p>

        <div className="add-income-card">

          {toastOk && (
            <div className="add-income-card__banner add-income-card__banner--success">
              <CheckCircle2 size={15} />
              Income saved — form cleared for the next entry.
            </div>
          )}

          {error && (
            <div className="add-income-card__banner add-income-card__banner--error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSave} noValidate>
            <div className="add-income-form">

              {/* Amount */}
              <div className="add-income-form__field--full">
                <label htmlFor="inc-amount" className="add-income-form__label">
                  Amount (Naira) <span className="required">*</span>
                </label>
                <div className="add-income-form__input-wrap">
                  <span className="add-income-form__prefix">₦</span>
                  <input
                    id="inc-amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    className="add-income-form__input add-income-form__input--prefix"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="inc-category" className="add-income-form__label">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="inc-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`add-income-form__select${!form.category ? " add-income-form__select--placeholder" : ""}`}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="inc-method" className="add-income-form__label">
                  Payment Method <span className="required">*</span>
                </label>
                <select
                  id="inc-method"
                  name="method"
                  value={form.method}
                  onChange={handleChange}
                  className={`add-income-form__select${!form.method ? " add-income-form__select--placeholder" : ""}`}
                  required
                >
                  <option value="" disabled>Select method</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label htmlFor="inc-customer" className="add-income-form__label">
                  Customer's Name <span className="optional">(Optional)</span>
                </label>
                <input
                  id="inc-customer"
                  name="customerName"
                  type="text"
                  placeholder="e.g. Mrs Adebayo"
                  value={form.customerName}
                  onChange={handleChange}
                  className="add-income-form__input"
                />
              </div>

              {/* Item */}
              <div>
                <label htmlFor="inc-item" className="add-income-form__label">
                  Item <span className="optional">(Optional)</span>
                </label>
                <input
                  id="inc-item"
                  name="item"
                  type="text"
                  placeholder="e.g. Rice 50 kg"
                  value={form.item}
                  onChange={handleChange}
                  className="add-income-form__input"
                />
              </div>

              {/* Date */}
              <div className="add-income-form__field--full">
                <label htmlFor="inc-date" className="add-income-form__label">
                  Date <span className="required">*</span>
                </label>
                <div className="add-income-form__input-wrap">
                  <input
                    id="inc-date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="add-income-form__input add-income-form__input--icon-right"
                    required
                  />
                  <span className="add-income-form__icon-right">
                    <CalendarDays size={15} />
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="add-income-form__field--full">
                <label htmlFor="inc-notes" className="add-income-form__label">
                  Notes <span className="optional">(Optional)</span>
                </label>
                <textarea
                  id="inc-notes"
                  name="notes"
                  rows={3}
                  placeholder="Any additional details…"
                  value={form.notes}
                  onChange={handleChange}
                  className="add-income-form__textarea"
                />
              </div>

              {/* Footer */}
              <div className="add-income-form__footer">
                <button
                  type="submit"
                  disabled={saving}
                  className="add-income-form__btn add-income-form__btn--primary"
                >
                  {saving
                    ? <><span className="add-income-form__spinner" /> Saving…</>
                    : "Save"
                  }
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveAndAnother}
                  className="add-income-form__btn add-income-form__btn--secondary"
                >
                  {saving && <span className="add-income-form__spinner" />}
                  Save &amp; Add Another
                </button>
              </div>

            </div>
          </form>
        </div>

        <p className="add-income-page__footnote">
          Fields marked <span>*</span> are required.
        </p>

      </div>
    </div>
  );
}
