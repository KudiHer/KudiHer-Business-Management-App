// =============================================================================
// src/pages/AddExpense/AddExpense.jsx
// =============================================================================
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, UploadCloud, X, FileImage, Loader2 } from "lucide-react";
import { addTransaction } from "../../services/TransactionService";
import "./AddExpense.css";

// ── Options ───────────────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  "Stock / Inventory",
  "Salaries",
  "Rent",
  "Utilities",
  "Transport",
  "Marketing",
  "Equipment",
  "Maintenance",
  "Other",
];

const PAYMENT_METHODS = ["Cash", "Transfer", "POS", "Cheque", "Other"];

// =============================================================================
export default function AddExpense() {
  const navigate  = useNavigate();
  const fileInput = useRef(null);

  const [form, setForm] = useState({
    amount:      "",
    category:    "",
    vendor:      "",
    description: "",
    method:      "",
    date:        new Date().toISOString().slice(0, 10),
  });

  const [receipt,        setReceipt]        = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [dragOver,       setDragOver]       = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Receipt helpers ───────────────────────────────────────────────────────
  const acceptFile = (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setError("Only PNG and JPG files are supported."); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB."); return;
    }
    setError(null);
    setReceipt(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => acceptFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const removeReceipt = () => {
    setReceipt(null);
    setReceiptPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.amount || Number(form.amount) <= 0) return "Please enter a valid amount.";
    if (!form.category)                           return "Please select a category.";
    if (!form.description.trim())                 return "Please enter a description.";
    if (!form.method)                             return "Please select a payment method.";
    if (!form.date)                               return "Please select a date.";
    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    try {
      await addTransaction({
        type:        "expense",
        amount:      Number(form.amount),
        category:    form.category,
        title:       form.description,
        vendor:      form.vendor,
        description: form.description,
        method:      form.method,
        date:        form.date,
      });
      navigate("/transactions");
    } catch (err) {
      setError(err.message || "Failed to save expense. Please try again.");
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="add-expense-page">
      <div className="add-expense-page__inner">

        <button
          type="button"
          className="add-expense-page__back"
          onClick={() => navigate("/transactions")}
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Transactions
        </button>

        <h1 className="add-expense-page__heading">Add Expense</h1>
        <p className="add-expense-page__subheading">Record money going out of your business</p>

        <div className="add-expense-card">

          {error && (
            <div className="add-expense-card__banner add-expense-card__banner--error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="add-expense-form">

              {/* Amount */}
              <div className="add-expense-form__field--full">
                <label htmlFor="exp-amount" className="add-expense-form__label">
                  Amount (Naira) <span className="required">*</span>
                </label>
                <div className="add-expense-form__input-wrap">
                  <span className="add-expense-form__prefix">₦</span>
                  <input
                    id="exp-amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    className="add-expense-form__input add-expense-form__input--prefix"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="exp-category" className="add-expense-form__label">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="exp-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`add-expense-form__select${!form.category ? " add-expense-form__select--placeholder" : ""}`}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="exp-method" className="add-expense-form__label">
                  Payment Method <span className="required">*</span>
                </label>
                <select
                  id="exp-method"
                  name="method"
                  value={form.method}
                  onChange={handleChange}
                  className={`add-expense-form__select${!form.method ? " add-expense-form__select--placeholder" : ""}`}
                  required
                >
                  <option value="" disabled>Select method</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div>
                <label htmlFor="exp-vendor" className="add-expense-form__label">
                  Vendor / Supplier <span className="optional">(Optional)</span>
                </label>
                <input
                  id="exp-vendor"
                  name="vendor"
                  type="text"
                  placeholder="e.g. Dangote Distributors"
                  value={form.vendor}
                  onChange={handleChange}
                  className="add-expense-form__input"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="exp-desc" className="add-expense-form__label">
                  Description <span className="required">*</span>
                </label>
                <input
                  id="exp-desc"
                  name="description"
                  type="text"
                  placeholder="e.g. Restocked Soft Drinks"
                  value={form.description}
                  onChange={handleChange}
                  className="add-expense-form__input"
                  required
                />
              </div>

              {/* Date */}
              <div className="add-expense-form__field--full">
                <label htmlFor="exp-date" className="add-expense-form__label">
                  Date <span className="required">*</span>
                </label>
                <div className="add-expense-form__input-wrap">
                  <input
                    id="exp-date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="add-expense-form__input add-expense-form__input--icon-right"
                    required
                  />
                  <span className="add-expense-form__icon-right">
                    <CalendarDays size={15} />
                  </span>
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="add-expense-form__field--full">
                <label className="add-expense-form__label">
                  Receipt Photo <span className="optional">(Optional)</span>
                </label>

                {receiptPreview ? (
                  <div className="add-expense-form__preview">
                    <div className="add-expense-form__preview-img-wrap">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="add-expense-form__preview-img"
                      />
                      <button
                        type="button"
                        className="add-expense-form__preview-remove"
                        onClick={removeReceipt}
                        aria-label="Remove receipt"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                    <p className="add-expense-form__preview-name">
                      <FileImage size={12} /> {receipt?.name}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`add-expense-form__dropzone${dragOver ? " add-expense-form__dropzone--active" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInput.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInput.current?.click()}
                    aria-label="Upload receipt image"
                  >
                    <UploadCloud size={36} className="add-expense-form__dropzone-icon" />
                    <div className="add-expense-form__dropzone-text">
                      <p>Click to upload <span>or drag and drop</span></p>
                      <p className="add-expense-form__dropzone-hint">PNG, JPG up to 5 MB</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  aria-hidden="true"
                />
              </div>

              {/* Footer */}
              <div className="add-expense-form__footer">
                <button
                  type="submit"
                  disabled={saving}
                  className="add-expense-form__btn add-expense-form__btn--primary"
                >
                  {saving
                    ? <><span className="add-expense-form__spinner" /> Saving…</>
                    : "Save Expense"
                  }
                </button>
              </div>

            </div>
          </form>
        </div>

        <p className="add-expense-page__footnote">
          Fields marked <span>*</span> are required.
        </p>

      </div>
    </div>
  );
}
