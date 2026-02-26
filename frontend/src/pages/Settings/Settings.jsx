import { useState } from "react";
import {
  Building2, User, Bell, Database,
  Mail, Phone, Lock, MapPin, ChevronRight, Save
} from "lucide-react";
import "./Settings.css";

const TABS = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "account", label: "Account", icon: User },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "data", label: "Data", icon: Database },
];

const BUSINESS_TYPES = ["Sole Proprietorship", "Partnership", "Retail Store", "Wholesale", "Food & Beverages", "Fashion & Clothing", "Electronics", "Other"];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");
  const [saved, setSaved] = useState(false);

  const [business, setBusiness] = useState({
    name: "Ada's Mart",
    type: "Retail Store",
    address: "12 Market Street, Ikeja, Lagos",
    phone: "+234 801 234 5667",
    rcNumber: "RC1234567",
  });

  const [account, setAccount] = useState({
    email: "ada@adasmart.com",
    phone: "+234 801 234 5667",
    password: "",
    confirmPassword: "",
  });

  const [alerts, setAlerts] = useState({
    whatsapp: true,
    sms: false,
    lowStock: true,
    reports: true,
    dailySummary: false,
    weeklySummary: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your business profile and preferences</p>
      </div>

      <div className="settings-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="settings-content">
        {activeTab === "business" && (
          <BusinessTab form={business} setForm={setBusiness} />
        )}
        {activeTab === "account" && (
          <AccountTab form={account} setForm={setAccount} />
        )}
        {activeTab === "alerts" && (
          <AlertsTab alerts={alerts} setAlerts={setAlerts} />
        )}
        {activeTab === "data" && (
          <DataTab />
        )}
      </div>

      {activeTab !== "data" && (
        <div className="settings-footer">
          <button
            className={`btn-save ${saved ? "saved" : ""}`}
            onClick={handleSave}
          >
            {saved ? "✓ Saved!" : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function BusinessTab({ form, setForm }) {
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="settings-section-card">
      <div className="section-heading">
        <Building2 size={18} color="#10B981" />
        <h2>Business Profile</h2>
      </div>
      <div className="settings-form">
        <div className="form-field">
          <label>Business Name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ada's Mart" />
        </div>
        <div className="form-field">
          <label>Business Type</label>
          <div className="select-wrapper">
            <select name="type" value={form.type} onChange={handleChange}>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronRight size={14} className="select-icon" style={{ transform: "translateY(-50%) rotate(90deg)" }} />
          </div>
        </div>
        <div className="form-field">
          <label><MapPin size={12} /> Business Address</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Enter full address" />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label><Phone size={12} /> Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234..." />
          </div>
          <div className="form-field">
            <label>RC Number (optional)</label>
            <input name="rcNumber" value={form.rcNumber} onChange={handleChange} placeholder="RC..." />
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountTab({ form, setForm }) {
  const [showPass, setShowPass] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="settings-section-card">
      <div className="section-heading">
        <User size={18} color="#10B981" />
        <h2>Account Settings</h2>
      </div>
      <div className="settings-form">
        <div className="form-field">
          <label><Mail size={12} /> Email Address</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
        </div>
        <div className="form-field">
          <label><Phone size={12} /> Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234..." />
        </div>
        <div className="password-divider">
          <span>Change Password</span>
        </div>
        <div className="form-field">
          <label><Lock size={12} /> New Password</label>
          <div className="password-field">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
            <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div className="form-field">
          <label>Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
          />
          {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
            <span className="field-error">Passwords do not match</span>
          )}
        </div>
      </div>
    </div>
  );
}

const ALERT_OPTIONS = [
  { key: "whatsapp", label: "WhatsApp Notifications", desc: "Get alerts sent to your WhatsApp number" },
  { key: "sms", label: "SMS Alerts", desc: "Receive SMS for critical updates" },
  { key: "lowStock", label: "Low Stock Alerts", desc: "Be notified when items drop below threshold" },
  { key: "reports", label: "Auto-generated Reports", desc: "Weekly reports delivered to your inbox" },
  { key: "dailySummary", label: "Daily Summary", desc: "Receive end-of-day business summary" },
  { key: "weeklySummary", label: "Weekly Summary", desc: "Performance overview every Monday morning" },
];

function AlertsTab({ alerts, setAlerts }) {
  const toggle = (key) => setAlerts({ ...alerts, [key]: !alerts[key] });

  return (
    <div className="settings-section-card">
      <div className="section-heading">
        <Bell size={18} color="#10B981" />
        <h2>Alert Preferences</h2>
      </div>
      <div className="alerts-list">
        {ALERT_OPTIONS.map((opt) => (
          <div className="alert-item" key={opt.key}>
            <div className="alert-item-info">
              <span className="alert-item-label">{opt.label}</span>
              <span className="alert-item-desc">{opt.desc}</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={alerts[opt.key]}
                onChange={() => toggle(opt.key)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataTab() {
  const [exporting, setExporting] = useState(false);

  const DATA_OPTIONS = [
    { label: "Export Transactions (CSV)", desc: "Download all transaction history", icon: "📊" },
    { label: "Export Inventory (CSV)", desc: "Download full stock list", icon: "📦" },
    { label: "Export Reports (PDF)", desc: "Bundle all generated reports", icon: "📄" },
    { label: "Backup Business Data", desc: "Create a complete data backup", icon: "💾" },
  ];

  const DANGER_OPTIONS = [
    { label: "Clear Transaction History", color: "#F59E0B", bg: "#FFFBEB" },
    { label: "Reset Inventory", color: "#EF4444", bg: "#FEF2F2" },
    { label: "Delete Account", color: "#DC2626", bg: "#FEF2F2" },
  ];

  return (
    <div className="settings-section-card">
      <div className="section-heading">
        <Database size={18} color="#10B981" />
        <h2>Data Management</h2>
      </div>
      <div className="data-options">
        {DATA_OPTIONS.map((opt) => (
          <button
            className="data-option-btn"
            key={opt.label}
            onClick={() => { setExporting(true); setTimeout(() => setExporting(false), 1500); }}
          >
            <span className="data-option-icon">{opt.icon}</span>
            <div className="data-option-info">
              <span className="data-option-label">{opt.label}</span>
              <span className="data-option-desc">{opt.desc}</span>
            </div>
            <ChevronRight size={16} color="#9CA3AF" />
          </button>
        ))}
      </div>

      <div className="danger-zone">
        <h3 className="danger-title">⚠️ Danger Zone</h3>
        <div className="danger-options">
          {DANGER_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className="danger-btn"
              style={{ color: opt.color, background: opt.bg, border: `1.5px solid ${opt.color}30` }}
              onClick={() => alert(`This action would ${opt.label.toLowerCase()}. Not available in demo.`)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
