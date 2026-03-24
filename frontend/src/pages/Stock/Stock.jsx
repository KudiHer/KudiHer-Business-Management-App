

import { useState, useEffect, useCallback } from "react";
import { Package, AlertTriangle, ChevronDown, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  createProduct,
  fetchProducts,
  updateProduct,
  deleteProduct,
} from "../../services/api";
import "./Stock.css";

const CATEGORIES = [
  "Food & Groceries", "Beverages", "Snacks", "Grains & Cereals",
  "Household", "Personal Care", "Other",
];
const UNITS = ["pieces", "kg", "litres", "bags", "cartons", "bottles", "packs", "dozen"];

const EMPTY_FORM = {
  name:            "",
  category:        "",
  unit:            "pieces",
  sku:             "",
  quantityInStock: "",
  costPrice:       "",
  sellingPrice:    "",
};

// =============================================================================
export default function Stock() {
  const [activeTab,  setActiveTab]  = useState("new");
  const [form,       setForm]       = useState({ ...EMPTY_FORM });
  const [editId,     setEditId]     = useState(null);   // product _id being edited
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState(null);
  const [submitted,  setSubmitted]  = useState(false);
  const [showAlert,  setShowAlert]  = useState(true);

  // ── Products list state (used by TotalProducts tab) ───────────────────────
  const [products,   setProducts]   = useState([]);
  const [listLoading,setListLoading]= useState(false);
  const [listError,  setListError]  = useState(null);

  // ── Load products whenever Total Products tab is shown ────────────────────
  const loadProducts = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const result = await fetchProducts();  // returns { count, items, raw }
      setProducts(result.items);
    } catch (err) {
      setListError(err.message || "Failed to load products.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "total") loadProducts();
  }, [activeTab, loadProducts]);

  // ── Form handlers ─────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setFormError(null);
  };

  // ── Start editing an existing product ─────────────────────────────────────
  const startEdit = (product) => {
    setForm({
      name:            product.name            ?? "",
      category:        product.category        ?? "",
      unit:            product.unit            ?? "pieces",
      sku:             product.sku             ?? "",
      quantityInStock: product.quantityInStock ?? "",
      costPrice:       product.costPrice       ?? "",
      sellingPrice:    product.sellingPrice    ?? "",
    });
    setEditId(product._id);
    setActiveTab("new");   // switch to form tab
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete a product ──────────────────────────────────────────────────────
  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setListError(err.message || "Failed to delete product.");
    }
  };

  // ── Validate form ─────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim())                          return "Product name is required.";
    if (!form.category)                             return "Category is required.";
    if (!form.sku.trim())                           return "SKU is required.";
    if (!form.quantityInStock || Number(form.quantityInStock) < 0)
                                                    return "Please enter a valid quantity.";
    if (!form.costPrice    || Number(form.costPrice)    <= 0) return "Please enter a valid cost price.";
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) return "Please enter a valid selling price.";
    return null;
  };

  // ── Submit: create or update ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }

    setSaving(true);
    setFormError(null);

    const payload = {
      name:            form.name.trim(),
      category:        form.category,
      unit:            form.unit,
      sku:             form.sku.trim(),
      quantityInStock: Number(form.quantityInStock),
      costPrice:       Number(form.costPrice),
      sellingPrice:    Number(form.sellingPrice),
    };

    try {
      if (editId) {
        // PUT /api/products/:id
        const updated = await updateProduct(editId, payload);
        setProducts((prev) =>
          prev.map((p) => (p._id === editId ? { ...p, ...updated } : p))
        );
      } else {
        // POST /api/products
        await createProduct(payload);
      }

      resetForm();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);

      // Reload the list so Total Products stays in sync
      loadProducts();
    } catch (err) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = Boolean(editId);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="stock-page">

      {/* ── Header ── */}
      <div className="stock-header">
        <div>
          <h1 className="stock-title">Stock</h1>
          <p className="stock-subtitle">Track your stock levels with convenience</p>
        </div>
        <div className="stock-tabs">
          <button
            className={`stock-tab ${activeTab === "new" ? "active" : ""}`}
            onClick={() => { resetForm(); setActiveTab("new"); }}
          >
            {isEditing ? "Edit Product" : "New Product"}
          </button>
          <button
            className={`stock-tab ${activeTab === "total" ? "active" : ""}`}
            onClick={() => { resetForm(); setActiveTab("total"); }}
          >
            Total Products
          </button>
        </div>
      </div>

      {/* ── New / Edit Product Form ── */}
      {activeTab === "new" && (
        <form className="stock-form-card" onSubmit={handleSubmit} noValidate>

          {/* Success banner */}
          {submitted && (
            <div className="stock-form-banner stock-form-banner--success">
              ✓ Product {isEditing ? "updated" : "added"} successfully!
            </div>
          )}

          {/* Error banner */}
          {formError && (
            <div className="stock-form-banner stock-form-banner--error">
              <span>⚠</span> {formError}
            </div>
          )}

          {/* Product Name */}
          <div className="form-field">
            <label>Product Name <span className="required">*</span></label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Rice 50 kg" required disabled={saving}
            />
          </div>

          {/* Category */}
          <div className="form-field">
            <label>Category <span className="required">*</span></label>
            <div className="select-wrapper">
              <select name="category" value={form.category} onChange={handleChange} required disabled={saving}>
                <option value="" disabled>Select</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          {/* Unit */}
          <div className="form-field">
            <label>Unit</label>
            <div className="select-wrapper">
              <select name="unit" value={form.unit} onChange={handleChange} disabled={saving}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          {/* SKU */}
          <div className="form-field">
            <label>SKU <span className="required">*</span></label>
            <input
              name="sku" value={form.sku} onChange={handleChange}
              placeholder="e.g. RICE-50KG-001" required disabled={saving}
            />
          </div>

          {/* Quantity & Cost Price */}
          <div className="form-row">
            <div className="form-field">
              <label>Quantity <span className="required">*</span></label>
              <input
                name="quantityInStock" type="number" min="0"
                value={form.quantityInStock} onChange={handleChange}
                placeholder="0" required disabled={saving}
              />
            </div>
            <div className="form-field">
              <label>Cost price (₦) <span className="required">*</span></label>
              <input
                name="costPrice" type="number" min="0" step="0.01"
                value={form.costPrice} onChange={handleChange}
                placeholder="0.00" required disabled={saving}
              />
            </div>
          </div>

          {/* Selling Price */}
          <div className="form-field">
            <label>Selling price (₦) <span className="required">*</span></label>
            <input
              name="sellingPrice" type="number" min="0" step="0.01"
              value={form.sellingPrice} onChange={handleChange}
              placeholder="0.00" required disabled={saving}
            />
          </div>

          {/* Profit preview */}
          {form.costPrice && form.sellingPrice &&
           Number(form.sellingPrice) > Number(form.costPrice) && (
            <div className="profit-preview">
              Profit margin:{" "}
              <strong>
                ₦{(Number(form.sellingPrice) - Number(form.costPrice)).toLocaleString()}
              </strong>{" "}
              per unit
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              disabled={saving}
              className={`btn-add-product ${submitted ? "success" : ""}`}
              style={{ flex: 1 }}
            >
              {saving
                ? "Saving…"
                : submitted
                ? `✓ Product ${isEditing ? "Updated" : "Added"}!`
                : isEditing
                ? "Update Product"
                : "Add Product"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="btn-add-product"
                style={{ flex: "0 0 auto", background: "#f0f2f5", color: "#555" }}
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      )}

      {/* ── Total Products Tab ── */}
      {activeTab === "total" && (
        <TotalProducts
          products={products}
          loading={listLoading}
          error={listError}
          onRetry={loadProducts}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ── AI Alert Toast ── */}
      {showAlert && (
        <div className="ai-alert-toast">
          <div className="ai-alert-icon">
            <AlertTriangle size={18} />
          </div>
          <div className="ai-alert-content">
            <span className="ai-alert-label">AI Alert</span>
            <p>3 items are fast-moving this week. Consider restocking before Monday to avoid lost sales.</p>
          </div>
          <button className="ai-alert-close" onClick={() => setShowAlert(false)}>×</button>
        </div>
      )}

    </div>
  );
}

// =============================================================================
// TotalProducts — live data from GET /api/products
// =============================================================================
function TotalProducts({ products, loading, error, onRetry, onEdit, onDelete }) {

  if (loading) {
    return (
      <div className="total-products">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "32px 0", color: "#888" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          Loading products…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="total-products">
        <div style={{ padding: "24px", background: "#fdecea", borderRadius: 12, color: "#c0392b" }}>
          <span>⚠ {error}</span>{" "}
          <button
            onClick={onRetry}
            style={{ marginLeft: 12, padding: "4px 12px", border: "1.5px solid #c0392b",
                     borderRadius: 6, background: "transparent", color: "#c0392b",
                     cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalValue = products.reduce(
    (s, p) => s + (p.quantityInStock ?? 0) * (p.costPrice ?? 0), 0
  );

  return (
    <div className="total-products">

      {/* Summary row */}
      <div className="tp-summary">
        <div className="tp-stat">
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="tp-stat">
          <span>Total Stock Value</span>
          <strong>₦{totalValue.toLocaleString()}</strong>
        </div>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#aaa" }}>
          <Package size={40} strokeWidth={1.2} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No products yet. Add your first product using the New Product tab.</p>
        </div>
      ) : (
        <div className="tp-table-wrapper">
          <table className="tp-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Cost</th>
                <th>Sell</th>
                <th>Margin</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="tp-product-name">
                      <Package size={14} />
                      {p.name}
                    </div>
                  </td>
                  <td><span className="tp-badge">{p.category}</span></td>
                  <td style={{ fontSize: 12, color: "#888" }}>{p.sku}</td>
                  <td>{p.quantityInStock} {p.unit}</td>
                  <td>₦{Number(p.costPrice).toLocaleString()}</td>
                  <td>₦{Number(p.sellingPrice).toLocaleString()}</td>
                  <td className="tp-margin">
                    +₦{(Number(p.sellingPrice) - Number(p.costPrice)).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        title="Edit"
                        onClick={() => onEdit(p)}
                        style={{ background: "none", border: "none", cursor: "pointer",
                                 color: "#1a9e6e", padding: 4 }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDelete(p)}
                        style={{ background: "none", border: "none", cursor: "pointer",
                                 color: "#e05252", padding: 4 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
