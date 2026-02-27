// =============================================================================
// src/pages/AddExpense/AddExpense.jsx
// =============================================================================
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, UploadCloud, X, FileImage, CheckCircle2 } from "lucide-react";
import { addTransaction } from "../../services/TransactionService";
import "./AddExpense.css";

const EXPENSE_CATEGORIES = [
  "Stock / Inventory", "Salaries", "Rent", "Utilities",
  "Transport", "Marketing", "Equipment", "Maintenance", "Other",
];

const PAYMENT_METHODS = ["Cash", "Transfer", "POS", "Cheque", "Other"];

const EMPTY_FORM = {
  amount:      "",
  category:    "",
  vendor:      "",
  description: "",
  method:      "",
  date:        new Date().toISOString().slice(0, 10),
};

export default function AddExpense() {
  const navigate  = useNavigate();
  const fileInput = useRef(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [receipt,        setReceipt]        = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [dragOver,       setDragOver]       = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [toastOk,        setToastOk]        = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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

  const removeReceipt = () => {
    setReceipt(null);
    setReceiptPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const validate = () => {
    if (!form.amount || Number(form.amount) <= 0) return "Please enter a valid amount.";
    if (!form.category)                           return "Please select a category.";
    if (!form.description.trim())                 return "Please enter a description.";
    if (!form.method)                             return "Please select a payment method.";
    return null;
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append("type", "expense");
    data.append("amount", form.amount);
    data.append("category", form.category);
    data.append("title", form.description); // Primary field for Transaction list
    data.append("description", form.description);
    data.append("vendor", form.vendor);
    data.append("method", form.method);
    data.append("date", form.date);
    if (receipt) data.append("receipt", receipt);
    return data;
  };

  const handleSave = async (e, shouldRedirect = true) => {
    if (e) e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    setError(null);
    try {
      // Note: If your backend doesn't support FormData, 
      // change buildFormData() back to a standard object.
      const payload = receipt ? buildFormData() : { 
        ...form, 
        type: "expense", 
        title: form.description, 
        amount: Number(form.amount) 
      };

      await addTransaction(payload);
      
      if (shouldRedirect) {
        navigate("/transactions");
      } else {
        // Handle "Save & Add Another"
        setForm({ ...EMPTY_FORM });
        removeReceipt();
        setToastOk(true);
        setTimeout(() => setToastOk(false), 3000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-expense-page">
      <div className="add-expense-page__inner">
        
        {/* Success Toast for "Add Another" */}
        {toastOk && (
          <div className="add-income-card__banner add-income-card__banner--success">
            <CheckCircle2 size={16} /> Expense saved successfully!
          </div>
        )}

        <button type="button" className="add-expense-page__back" onClick={() => navigate("/transactions")}>
          <ArrowLeft size={16} strokeWidth={2.5} /> Back to Transactions
        </button>

        <h1 className="add-expense-page__heading">Add Expense</h1>
        <p className="add-expense-page__subheading">Record money going out of your business</p>

        <div className="add-expense-card">
          {error && <div className="add-expense-card__banner add-expense-card__banner--error"><span>⚠</span> {error}</div>}

          <form onSubmit={(e) => handleSave(e, true)} noValidate>
            <div className="add-expense-form">
              <div className="add-expense-form__field--full">
                <label htmlFor="exp-amount" className="add-expense-form__label">Amount (Naira) <span className="required">*</span></label>
                <div className="add-expense-form__input-wrap">
                  <span className="add-expense-form__prefix">₦</span>
                  <input
                    id="exp-amount" name="amount" type="number" placeholder="0.00"
                    value={form.amount} onChange={handleChange}
                    className="add-expense-form__input add-expense-form__input--prefix" autoFocus required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="exp-category" className="add-expense-form__label">Category <span className="required">*</span></label>
                <select id="exp-category" name="category" value={form.category} onChange={handleChange} className="add-expense-form__select" required>
                  <option value="" disabled>Select category</option>
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="exp-method" className="add-expense-form__label">Payment Method <span className="required">*</span></label>
                <select id="exp-method" name="method" value={form.method} onChange={handleChange} className="add-expense-form__select" required>
                  <option value="" disabled>Select method</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="exp-vendor" className="add-expense-form__label">Vendor / Supplier <span className="optional">(Optional)</span></label>
                <input id="exp-vendor" name="vendor" type="text" placeholder="e.g. Suppliers" value={form.vendor} onChange={handleChange} className="add-expense-form__input" />
              </div>

              <div>
                <label htmlFor="exp-desc" className="add-expense-form__label">Description <span className="required">*</span></label>
                <input id="exp-desc" name="description" type="text" placeholder="e.g. Restocked Inventory" value={form.description} onChange={handleChange} className="add-expense-form__input" required />
              </div>

              <div className="add-expense-form__field--full">
                <label htmlFor="exp-date" className="add-expense-form__label">Date <span className="required">*</span></label>
                <div className="add-expense-form__input-wrap">
                  <input id="exp-date" name="date" type="date" value={form.date} onChange={handleChange} className="add-expense-form__input add-expense-form__input--icon-right" required />
                  <span className="add-expense-form__icon-right"><CalendarDays size={15} /></span>
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="add-expense-form__field--full">
                <label className="add-expense-form__label">Receipt Photo <span className="optional">(Optional)</span></label>
                {receiptPreview ? (
                  <div className="add-expense-form__preview">
                    <div className="add-expense-form__preview-img-wrap">
                      <img src={receiptPreview} alt="Preview" className="add-expense-form__preview-img" />
                      <button type="button" className="add-expense-form__preview-remove" onClick={removeReceipt}><X size={12} /></button>
                    </div>
                    <p className="add-expense-form__preview-name"><FileImage size={12} /> {receipt?.name}</p>
                  </div>
                ) : (
                  <div 
                    className={`add-expense-form__dropzone${dragOver ? " add-expense-form__dropzone--active" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); acceptFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileInput.current?.click()}
                  >
                    <UploadCloud size={36} />
                    <div className="add-expense-form__dropzone-text">
                      <p>Click to upload <span>or drag and drop</span></p>
                    </div>
                  </div>
                )}
                <input ref={fileInput} type="file" accept="image/*" onChange={(e) => acceptFile(e.target.files[0])} style={{ display: "none" }} />
              </div>

              <div className="add-expense-form__footer">
                <button type="submit" disabled={saving} className="add-expense-form__btn add-expense-form__btn--primary">
                  {saving ? "Saving..." : "Save Expense"}
                </button>
                <button 
                  type="button" 
                  disabled={saving} 
                  onClick={() => handleSave(null, false)} 
                  className="add-expense-form__btn add-expense-form__btn--secondary"
                  style={{ border: '1px solid #1a9e6e', color: '#1a9e6e', background: 'transparent', width: '100%', marginTop: '10px' }}
                >
                  Save & Add Another
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}