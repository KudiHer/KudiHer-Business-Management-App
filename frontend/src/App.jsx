

import "./themes/global.css";
import { Routes, Route }  from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import AppLayout          from "./components/AppLayout/AppLayout";  // ← NEW

// ── Auth / onboarding pages (no sidebar) ─────────────────────────────────────
import WelcomePage    from "./pages/WelcomePage/WelcomePage";
import CreateAccount  from "./pages/CreateAccount/CreateAccount";
import SignIn         from "./pages/SignIn/SignIn";
import BusinessSetup  from "./pages/BusinessSetup/BusinessSetup";

// ── App pages (all get AppLayout) ────────────────────────────────────────────
import Dashboard     from "./pages/Dashboard/Dashboard";
import Transactions  from "./pages/Transactions/Transactions";
import AddIncome     from "./pages/AddIncome/AddIncome";
import AddExpense    from "./pages/AddExpense/AddExpense";
import Loans              from "./pages/Loans/Loans"; 
import InventoryAI   from "./pages/InventoryAi/InventoryAi";
import Stock         from "./pages/Stock/Stock";
import Reports       from "./pages/Reports/Reports";
import CashFlow      from "./pages/CashFlow/CashFlow";
import Profitability from "./pages/Profitability/Profitability";
import Settings      from "./pages/Settings/Settings";

// =============================================================================
function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Auth / onboarding routes — no sidebar, no AppLayout ── */}
        <Route path="/"               element={<WelcomePage />}   />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/signin"         element={<SignIn />}         />
        <Route path="/business-setup" element={<BusinessSetup />} />

        {/* ── Authenticated app routes — all wrapped in AppLayout ──
            The `title` prop is shown in the mobile top-bar on each page.  ── */}

        <Route path="/dashboard" element={
          <AppLayout title="Dashboard">
            <Dashboard />
          </AppLayout>
        } />

        <Route path="/transactions" element={
          <AppLayout title="Transactions">
            <Transactions />
          </AppLayout>
        } />

        <Route path="/add-income" element={
          <AppLayout title="Add Income">
            <AddIncome />
          </AppLayout>
        } />

        <Route path="/add-expense" element={
          <AppLayout title="Add Expense">
            <AddExpense />
          </AppLayout>
        } />

        <Route path="/loans" element={
          <AppLayout title="Loans">
            <Loans />
          </AppLayout>
        } />

        <Route path="/inventoryai" element={
          <AppLayout title="Inventory AI">
            <InventoryAI />
          </AppLayout>
        } />

        <Route path="/stock" element={
          <AppLayout title="Stock">
            <Stock />
          </AppLayout>
        } />

        <Route path="/reports" element={
          <AppLayout title="Reports">
            <Reports />
          </AppLayout>
        } />

        <Route path="/cashflow" element={
          <AppLayout title="Cash Flow">
            <CashFlow />
          </AppLayout>
        } />

        <Route path="/profitability" element={
          <AppLayout title="Profitability">
            <Profitability />
          </AppLayout>
        } />

        <Route path="/settings" element={
          <AppLayout title="Settings">
            <Settings />
          </AppLayout>
        } />

      </Routes>
    </AuthProvider>
  );
}

export default App;
