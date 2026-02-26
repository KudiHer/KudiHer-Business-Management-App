import { useState } from "react";
import {
  LayoutDashboard, Calendar, TrendingUp, Activity,
  FileText, Package, Download, ChevronRight, Sparkles
} from "lucide-react";
import "./Reports.css";

const REPORT_CARDS = [
  {
    id: "daily",
    icon: LayoutDashboard,
    title: "Daily Summary",
    description: "Today's income, expenses, and net profit at a glance",
    color: "#10B981",
  },
  {
    id: "weekly",
    icon: Calendar,
    title: "Weekly Summary",
    description: "7-day performance overview with trends",
    color: "#059669",
  },
  {
    id: "monthly",
    icon: TrendingUp,
    title: "Monthly Profit and Loss Statement",
    description: "Complete profit and loss for the current month",
    color: "#10B981",
  },
  {
    id: "cashflow",
    icon: Activity,
    title: "Cash Flow Reports",
    description: "Detailed cash inflows and outflows analysis",
    color: "#059669",
  },
  {
    id: "loan",
    icon: FileText,
    title: "Loan-ready Reports",
    description: "Professional report formatted for microfinance lenders",
    color: "#10B981",
  },
  {
    id: "inventory",
    icon: Package,
    title: "Inventory Reports",
    description: "Stock levels, fast/slow movers and restock alerts",
    color: "#059669",
  },
];

const LOAN_FEATURES = [
  "6-Month Profit and Loss Statement",
  "Cash Flow Projection",
  "Inventory Valuation Report",
];

export default function Reports() {
  const [generating, setGenerating] = useState(null);
  const [generated, setGenerated] = useState({});

  const handleGenerate = (id) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      setGenerated(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setGenerated(prev => ({ ...prev, [id]: false })), 3000);
    }, 1500);
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">Manage records and prepare for growth financing</p>
        </div>
        <button className="btn-loan-ready">
          <Sparkles size={15} />
          Generate Loan-ready reports
        </button>
      </div>

      <div className="reports-grid">
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon;
          const isGenerating = generating === card.id;
          const isDone = generated[card.id];
          return (
            <div className={`report-card ${card.id === "loan" ? "loan-card" : ""}`} key={card.id}>
              <div className="report-card-header">
                <div className="report-icon" style={{ background: card.id === "loan" ? "#D1FAE5" : "#E9FBF2" }}>
                  <Icon size={18} color={card.color} />
                </div>
                <h3 className="report-card-title">{card.title}</h3>
              </div>
              <p className="report-card-desc">{card.description}</p>
              <div className="report-card-actions">
                <button
                  className={`btn-generate ${isGenerating ? "loading" : ""} ${isDone ? "done" : ""}`}
                  onClick={() => handleGenerate(card.id)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <span className="spinner" />
                  ) : isDone ? "✓ Done" : "Generate"}
                </button>
                <div className="pdf-action">
                  <Download size={14} />
                  <span>PDF</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="loan-advantage-section">
        <div className="loan-advantage-header">
          <Download size={18} color="#10B981" />
          <h2>The Loan-Ready Advantage</h2>
        </div>
        <p className="loan-advantage-desc">
          Banks and fintech lenders require standard financial statements. KudiHer automatically
          formats your sales, expenses, and inventory data into:
        </p>
        <div className="loan-features-list">
          {LOAN_FEATURES.map((feat) => (
            <div className="loan-feature-pill" key={feat}>
              <ChevronRight size={14} color="#10B981" />
              {feat}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
