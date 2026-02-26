// =============================================================================
// src/pages/InventoryAI/InventoryAI.jsx
//
// File placement:  src/pages/InventoryAI/InventoryAI.jsx
// CSS companion:   src/pages/InventoryAI/InventoryAI.css
//
// Routing (add to App.jsx — same pattern as every other app page):
//   import InventoryAI from "./pages/InventoryAI/InventoryAI";
//   <Route path="/inventory-ai" element={
//     <main className="appContainer"><SideBar /><InventoryAI /></main>
//   } />
// =============================================================================

import { useState, useMemo } from "react";
import {
  Bell,
  Plus,
  SlidersHorizontal,
  Search,
  TrendingUp,
  Zap,
  MoreVertical,
} from "lucide-react";
import "./InventoryAI.css";

// ── Inventory data ─────────────────────────────────────────────────────────────
const DUMMY_INVENTORY = [
  { id: 1,  name: "Rice 50 kg",  stock: 12,  unit: "units", status: "too-low",  movement: "fast"   },
  { id: 2,  name: "Noodles",     stock: 45,  unit: "units", status: "low",      movement: "normal" },
  { id: 3,  name: "Chin chin",   stock: 5,   unit: "units", status: "too-low",  movement: "fast"   },
  { id: 4,  name: "Soft drinks", stock: 120, unit: "units", status: "in-stock", movement: "slow"   },
  { id: 5,  name: "Seasoning",   stock: 12,  unit: "units", status: "too-low",  movement: "normal" },
  { id: 6,  name: "Cookies",     stock: 39,  unit: "units", status: "low",      movement: "slow"   },
  { id: 7,  name: "Palm oil",    stock: 220, unit: "units", status: "in-stock", movement: "normal" },
  { id: 8,  name: "Eggs",        stock: 12,  unit: "units", status: "too-low",  movement: "fast"   },
  { id: 9,  name: "Spaghetti",   stock: 130, unit: "units", status: "in-stock", movement: "slow"   },
  { id: 10, name: "Chocolate",   stock: 45,  unit: "units", status: "low",      movement: "fast"   },
  { id: 11, name: "Biscuits",    stock: 34,  unit: "units", status: "too-low",  movement: "normal" },
  { id: 12, name: "Wine",        stock: 50,  unit: "units", status: "low",      movement: "slow"   },
];

// ── Status pill config ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  "in-stock": { label: "In stock", dotClass: "inv-dot--green",  pillClass: "inv-pill--green"  },
  "low":      { label: "Low",      dotClass: "inv-dot--amber",  pillClass: "inv-pill--amber"  },
  "too-low":  { label: "Too low",  dotClass: "inv-dot--red",    pillClass: "inv-pill--red"    },
};

// ── Movement label config ─────────────────────────────────────────────────────
const MOVEMENT_CLASS = {
  fast:   "inv-movement--fast",
  slow:   "inv-movement--slow",
  normal: "inv-movement--normal",
};

// ── StatusPill component ──────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span className={`inv-pill ${cfg.pillClass}`}>
      <span className={`inv-dot ${cfg.dotClass}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InventoryAI() {
  const [search,     setSearch]     = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  // Live client-side search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return DUMMY_INVENTORY;
    return DUMMY_INVENTORY.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [search]);

  // Close dropdown when clicking outside
  const handlePageClick = () => {
    if (openMenuId !== null) setOpenMenuId(null);
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="inv-page" onClick={handlePageClick}>

      {/* ════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════ */}
      <div className="inv-header">
        <div className="inv-header__text">
          <h1 className="inv-header__title">Inventory Intelligence</h1>
          <p className="inv-header__subtitle">AI powered tracking for your stock levels</p>
        </div>

        <button className="inv-bell-btn" aria-label="Notifications">
          <Bell size={22} strokeWidth={1.8} />
          <span className="inv-bell-btn__badge" aria-hidden="true" />
        </button>
      </div>

      {/* ════════════════════════════════════════════
          ACTION BAR  (Add Item / Filter)
      ════════════════════════════════════════════ */}
      <div className="inv-topbar">
        <button className="inv-btn inv-btn--primary">
          <Plus size={16} strokeWidth={2.5} />
          Add Item
        </button>
        <button className="inv-btn inv-btn--outline">
          <SlidersHorizontal size={15} strokeWidth={2} />
          Filter
        </button>
      </div>

      {/* ════════════════════════════════════════════
          ANALYTICS CARDS  (3-column row)
      ════════════════════════════════════════════ */}
      <div className="inv-cards-row">

        {/* ── Fast Moving ── */}
        <div className="inv-card inv-card--green">
          <div className="inv-card__head">
            <span className="inv-card__heading">Fast Moving</span>
            <TrendingUp size={18} strokeWidth={2} className="inv-card__head-icon" />
          </div>

          <p className="inv-card__desc">Items sold more than 50 times this week</p>

          <div className="inv-card__items">
            <div className="inv-card__fast-row">
              <span className="inv-card__fast-name">Soft Drinks</span>
              <span className="inv-card__fast-badge">+42%</span>
            </div>
            <div className="inv-card__fast-row">
              <span className="inv-card__fast-name">Noodles</span>
              <span className="inv-card__fast-badge">+18%</span>
            </div>
          </div>
        </div>

        {/* ── Slow Moving ── */}
        <div className="inv-card inv-card--white">
          <div className="inv-card__head">
            <span className="inv-card__heading inv-card__heading--dark">Slow Moving</span>
            <Zap size={17} strokeWidth={2} className="inv-card__head-icon inv-card__head-icon--muted" />
          </div>

          <p className="inv-card__desc inv-card__desc--muted">
            Items with no sales in 30 plus days
          </p>

          <div className="inv-card__slow-list">
            <div className="inv-card__slow-row">
              <span className="inv-card__slow-name">Soap</span>
              <span className="inv-card__slow-pct">-65%</span>
            </div>
            <div className="inv-card__slow-row">
              <span className="inv-card__slow-name">Sponge</span>
              <span className="inv-card__slow-pct">-22%</span>
            </div>
          </div>

          <button className="inv-card__promo-btn">Create discount promo</button>
        </div>

        {/* ── Restock Alerts ── */}
        <div className="inv-card inv-card--white">
          <div className="inv-card__head">
            <span className="inv-card__heading inv-card__heading--dark">Restock Alerts</span>
            <Bell size={17} strokeWidth={2} className="inv-card__head-icon inv-card__head-icon--orange" />
          </div>

          <div className="inv-card__restock-count">
            <span className="inv-card__restock-num">4</span>
            <span className="inv-card__restock-label">items need attention</span>
          </div>

          <div className="inv-card__progress-track">
            <div className="inv-card__progress-fill" />
          </div>

          <p className="inv-card__whatsapp-note">
            Notifications sent via Whatsapp to +2348012345667
          </p>
        </div>

      </div>

      {/* ════════════════════════════════════════════
          INVENTORY TABLE SECTION
      ════════════════════════════════════════════ */}
      <div className="inv-table-section">

        {/* ── Search + Legend ── */}
        <div className="inv-table-toolbar">
          <div className="inv-search">
            <Search size={15} className="inv-search__icon" aria-hidden="true" />
            <input
              className="inv-search__input"
              type="search"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search inventory items"
            />
          </div>

          <div className="inv-legend">
            <span className="inv-legend__item">
              <span className="inv-dot inv-dot--sm inv-dot--green" aria-hidden="true" />
              In stock
            </span>
            <span className="inv-legend__item">
              <span className="inv-dot inv-dot--sm inv-dot--amber" aria-hidden="true" />
              Low
            </span>
            <span className="inv-legend__item">
              <span className="inv-dot inv-dot--sm inv-dot--red" aria-hidden="true" />
              Too low
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="inv-table-scroll">
          <table className="inv-table">
            <thead>
              <tr>
                <th className="inv-table__th inv-table__th--name">Item Name</th>
                <th className="inv-table__th">Current Stock</th>
                <th className="inv-table__th">AI Status</th>
                <th className="inv-table__th">Movement</th>
                <th className="inv-table__th inv-table__th--action">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="inv-table__empty" colSpan={5}>
                    No items match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="inv-table__row">

                    {/* Name */}
                    <td className="inv-table__td inv-table__td--name">
                      {item.name}
                    </td>

                    {/* Stock */}
                    <td className="inv-table__td inv-table__td--stock">
                      <strong>{item.stock}</strong> {item.unit}
                    </td>

                    {/* AI Status pill */}
                    <td className="inv-table__td">
                      <StatusPill status={item.status} />
                    </td>

                    {/* Movement */}
                    <td className="inv-table__td">
                      <span className={`inv-movement ${MOVEMENT_CLASS[item.movement] ?? ""}`}>
                        {item.movement.charAt(0).toUpperCase() + item.movement.slice(1)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="inv-table__td inv-table__td--action">
                      <div className="inv-action">
                        <button
                          className="inv-action__trigger"
                          aria-label={`Actions for ${item.name}`}
                          onClick={(e) => toggleMenu(e, item.id)}
                        >
                          <MoreVertical size={16} strokeWidth={2} />
                        </button>

                        {openMenuId === item.id && (
                          <div
                            className="inv-action__menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="inv-action__menu-item">Edit item</button>
                            <button className="inv-action__menu-item">Restock</button>
                            <button className="inv-action__menu-item inv-action__menu-item--danger">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
