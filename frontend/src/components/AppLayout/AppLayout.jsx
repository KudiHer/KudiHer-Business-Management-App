// =============================================================================
// src/components/AppLayout/AppLayout.jsx
//
// Shared layout wrapper for every authenticated page.
// Replaces the repeated <main className="appContainer"><SideBar />…</main>
// pattern in App.jsx with a single component that handles:
//
//   Desktop (>768px):
//     └─ .appContainer  (flex row)
//           ├─ <SideBar />       (260px, always visible)
//           └─ {children}        (flex:1, page content)
//
//   Mobile (≤768px):
//     └─ .appContainer  (flex column, full width)
//           ├─ <MobileTopBar />  (sticky, hamburger + page title)
//           ├─ <DrawerBackdrop/>
//           ├─ <Drawer />        (slide-in nav panel)
//           └─ {children}        (page content, full width)
//
// Usage in App.jsx:
//   <Route path="/stock" element={<AppLayout title="Stock"><Stock /></AppLayout>} />
//
// The `title` prop is the compact label shown in the mobile top-bar.
// =============================================================================

import { useState }       from "react";
import { NavLink, Outlet } from "react-router-dom";
import { SideBar }        from "../SideBar/SideBar";
import { useAuth }        from "../../context/AuthContext";

// ── Same SVG assets as SideBar.jsx ────────────────────────────────────────────
import KudiHerLogo       from "../../assets/images/kudiHerLogo.svg?react";
import DashboardIcon     from "../../assets/images/sideBarImages/dashboardIcon.svg?react";
import TransactionsIcon  from "../../assets/images/sideBarImages/transactionIcon.svg?react";
import InventoryAiIcon   from "../../assets/images/sideBarImages/inventoryAiIcon.svg?react";
import StockIcon         from "../../assets/images/sideBarImages/stockIcon.svg?react";
import ReportsIcon       from "../../assets/images/sideBarImages/reportsIcon.svg?react";
import CashFlowIcon      from "../../assets/images/sideBarImages/cashFlowIcon.svg?react";
import ProfitabilityIcon from "../../assets/images/sideBarImages/profitabilityIcon.svg?react";
import SettingsIcon      from "../../assets/images/sideBarImages/settingsIcon.svg?react";
import ProfileImageIcon  from "../../assets/images/sideBarImages/profileImageIcon.svg?react";

import "./AppLayout.css";

// ── Nav items — mirror SideBar.jsx exactly ────────────────────────────────────
const NAV_ITEMS = [
  { to: "/dashboard",     label: "Dashboard",    Icon: DashboardIcon     },
  { to: "/transactions",  label: "Transactions", Icon: TransactionsIcon  },
  { to: "/inventoryai",   label: "Inventory AI", Icon: InventoryAiIcon   },
  { to: "/stock",         label: "Stock",        Icon: StockIcon         },
  { to: "/reports",       label: "Reports",      Icon: ReportsIcon       },
  { to: "/cashflow",      label: "Cash Flow",    Icon: CashFlowIcon      },
  { to: "/profitability", label: "Profitability",Icon: ProfitabilityIcon },
];

// =============================================================================
export default function AppLayout({ children, title = "KudiHer" }) {
  const { user }                    = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer                 = () => setDrawerOpen(false);

  return (
    <div className="appLayout">

      {/* ════════════════════════════════════════════════════════════════
          MOBILE TOP-BAR  — sticky bar visible only on ≤768px
          [mint hamburger]   [page title]   [invisible spacer]
      ════════════════════════════════════════════════════════════════ */}
      <header className="appLayout__topBar">
        <button
          className="appLayout__hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
        >
          {/* Three-line hamburger */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="2" y="4"  width="16" height="2" rx="1" fill="currentColor"/>
            <rect x="2" y="9"  width="16" height="2" rx="1" fill="currentColor"/>
            <rect x="2" y="14" width="16" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>

        <span className="appLayout__topBarTitle">{title}</span>

        {/* Spacer mirrors hamburger width so title stays optically centred */}
        <div className="appLayout__topBarSpacer" aria-hidden="true" />
      </header>

      {/* ════════════════════════════════════════════════════════════════
          DRAWER BACKDROP  — always in DOM, transparent until open
      ════════════════════════════════════════════════════════════════ */}
      <div
        className={`appLayout__backdrop${drawerOpen ? " appLayout__backdrop--visible" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ════════════════════════════════════════════════════════════════
          MOBILE DRAWER  — slides in from left
          Identical look to SideBar.jsx (same tokens, same icons)
      ════════════════════════════════════════════════════════════════ */}
      <nav
        className={`appLayout__drawer${drawerOpen ? " appLayout__drawer--open" : ""}`}
        aria-label="Mobile navigation"
      >
        {/* ── Header: logo + close button ── */}
        <div className="appLayout__drawerHead">
          <div className="appLayout__drawerLogoRow">
            <KudiHerLogo className="appLayout__drawerLogo" />
            <span className="appLayout__drawerLogoText">KudiHer</span>
          </div>
          <button
            className="appLayout__drawerClose"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 3L15 15M15 3L3 15"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Primary nav links ── */}
        <ul className="appLayout__drawerNav">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={closeDrawer}
                className={({ isActive }) =>
                  `appLayout__drawerLink${isActive ? " appLayout__drawerLink--active" : ""}`
                }
              >
                <Icon className="appLayout__drawerIcon" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Bottom: Settings + profile ── */}
        <div className="appLayout__drawerBottom">
          <NavLink
            to="/settings"
            onClick={closeDrawer}
            className={({ isActive }) =>
              `appLayout__drawerLink${isActive ? " appLayout__drawerLink--active" : ""}`
            }
          >
            <SettingsIcon className="appLayout__drawerIcon" />
            <span>Settings</span>
          </NavLink>

          <div className="appLayout__drawerProfile">
            <ProfileImageIcon className="appLayout__drawerProfileIcon" />
            <div className="appLayout__drawerProfileText">
              <span className="appLayout__drawerProfileName">
                {user?.businessName || "Business"}
              </span>
              <span className="appLayout__drawerProfileRole">
                {user?.businessType || "Store Owner"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP SHELL  — flex row: sidebar + page content
          On mobile the sidebar is hidden via SideBar.css media query,
          so the page content fills the full width automatically.
      ════════════════════════════════════════════════════════════════ */}
      <div className="appLayout__body">
        <SideBar />
        <div className="appLayout__content">
          {children}
        </div>
      </div>

    </div>
  );
}
