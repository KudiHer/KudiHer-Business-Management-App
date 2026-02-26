import { useState } from "react";
import { Package, AlertTriangle, ChevronDown } from "lucide-react";
import "./Stock.css";

const CATEGORIES = ["Food & Groceries", "Beverages", "Snacks", "Grains & Cereals", "Household", "Personal Care", "Other"];
const UNITS = ["pieces", "kg", "litres", "bags", "cartons", "bottles", "packs", "dozen"];

export default function Stock() {
  const [activeTab, setActiveTab] = useState("new");
  const [form, setForm] = useState({
    name: "", category: "", unit: "pieces", quantity: "", costPrice: "", sellingPrice: ""
  });
  const [showAlert, setShowAlert] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setForm({ name: "", category: "", unit: "pieces", quantity: "", costPrice: "", sellingPrice: "" });
  };

  return (
    <div className="stock-page">
      <div className="stock-header">
        <div>
          <h1 className="stock-title">Stock</h1>
          <p className="stock-subtitle">Track your stock levels with convenience</p>
        </div>
        <div className="stock-tabs">
          <button
            className={`stock-tab ${activeTab === "new" ? "active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            New Product
          </button>
          <button
            className={`stock-tab ${activeTab === "total" ? "active" : ""}`}
            onClick={() => setActiveTab("total")}
          >
            Total Products
          </button>
        </div>
      </div>

      {activeTab === "new" ? (
        <form className="stock-form-card" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rice 50 kg"
              required
            />
          </div>

          <div className="form-field">
            <label>Category</label>
            <div className="select-wrapper">
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="" disabled>Select</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="form-field">
            <label>Unit</label>
            <div className="select-wrapper">
              <select name="unit" value={form.unit} onChange={handleChange}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Quantity</label>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="0" required />
            </div>
            <div className="form-field">
              <label>Cost price (₦)</label>
              <input name="costPrice" type="number" min="0" value={form.costPrice} onChange={handleChange} placeholder="0.00" required />
            </div>
          </div>

          <div className="form-field">
            <label>Selling price (₦)</label>
            <input name="sellingPrice" type="number" min="0" value={form.sellingPrice} onChange={handleChange} placeholder="0.00" required />
          </div>

          {form.costPrice && form.sellingPrice && Number(form.sellingPrice) > Number(form.costPrice) && (
            <div className="profit-preview">
              Profit margin: <strong>₦{(Number(form.sellingPrice) - Number(form.costPrice)).toLocaleString()}</strong> per unit
            </div>
          )}

          <button type="submit" className={`btn-add-product ${submitted ? "success" : ""}`}>
            {submitted ? "✓ Product Added!" : "Add Product"}
          </button>
        </form>
      ) : (
        <TotalProducts />
      )}

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

const DUMMY_PRODUCTS = [
  { name: "Rice 50 kg", category: "Grains & Cereals", unit: "bags", qty: 12, cost: 35000, sell: 42000 },
  { name: "Noodles", category: "Food & Groceries", unit: "cartons", qty: 45, cost: 2800, sell: 3500 },
  { name: "Soft Drinks", category: "Beverages", unit: "cartons", qty: 120, cost: 2500, sell: 3200 },
  { name: "Chin Chin", category: "Snacks", unit: "kg", qty: 5, cost: 1500, sell: 2200 },
  { name: "Palm Oil", category: "Food & Groceries", unit: "litres", qty: 220, cost: 1200, sell: 1600 },
];

function TotalProducts() {
  return (
    <div className="total-products">
      <div className="tp-summary">
        <div className="tp-stat"><span>Total Products</span><strong>{DUMMY_PRODUCTS.length}</strong></div>
        <div className="tp-stat"><span>Total Stock Value</span><strong>₦{DUMMY_PRODUCTS.reduce((s, p) => s + p.qty * p.cost, 0).toLocaleString()}</strong></div>
      </div>
      <div className="tp-table-wrapper">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Cost</th>
              <th>Sell</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_PRODUCTS.map((p, i) => (
              <tr key={i}>
                <td><div className="tp-product-name"><Package size={14} />{p.name}</div></td>
                <td><span className="tp-badge">{p.category}</span></td>
                <td>{p.qty} {p.unit}</td>
                <td>₦{p.cost.toLocaleString()}</td>
                <td>₦{p.sell.toLocaleString()}</td>
                <td className="tp-margin">+₦{(p.sell - p.cost).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
