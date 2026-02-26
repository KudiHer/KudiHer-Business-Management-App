import "./themes/global.css";
import { Routes, Route } from "react-router-dom";
import { SideBar } from "./components/SideBar/SideBar";
import  Dashboard  from "./pages/Dashboard/Dashboard";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import SignIn from "./pages/SignIn/SignIn";
import BusinessSetup from "./pages/BusinessSetup/BusinessSetup";
import Transactions  from "./pages/Transactions/Transactions";
import { AuthProvider } from './context/AuthContext';
import AddIncome        from "./pages/AddIncome/AddIncome";    
import AddExpense       from "./pages/AddExpense/AddExpense"; 
import InventoryAI      from "./pages/InventoryAI/InventoryAI";
import Stock            from "./pages/Stock/Stock";
import Reports         from "./pages/Reports/Reports";
import CashFlow         from "./pages/CashFlow/CashFlow";
import Profitability      from "./pages/Profitability/Profitability";
import Settings         from "./pages/Settings/Settings";


function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/business-setup" element={<BusinessSetup />} />

      {/* App pages - with sidebar */}
      <Route
        path="/dashboard"
        element={
          <main className="appContainer">
            <SideBar />
            <Dashboard />
          </main>
        }
      />
      <Route
        path="/transactions"
        element={
          <main className="appContainer">
            <SideBar />
            <Transactions />
          </main>
        }
      />
      <Route
              path="/add-income"
              element={
                <main className="appContainer">
                  <SideBar />
                  <AddIncome />
                </main>
              }
            />
      
            
            <Route
              path="/add-expense"
              element={
                <main className="appContainer">
                  <SideBar />
                  <AddExpense />
                </main>
              }
            />
      <Route
        path="/inventoryai"
        element={ 
          <main className="appContainer">
            <SideBar />
            <InventoryAI />
          </main>
        }
      />
      <Route
        path="/stock"
        element={ 
          <main className="appContainer">
            <SideBar />
            <Stock />
          </main>
        }
      />
      <Route
        path="/reports"
        element={
          <main className="appContainer">
            <SideBar />
            <Reports />
          </main>
        }
      />
      <Route
        path="/cashflow"
        element={
          <main className="appContainer">
            <SideBar />
            <CashFlow />
          </main>
        }
      />
      <Route
        path="/profitability"
        element={
          <main className="appContainer">
            <SideBar />
            <Profitability />
          </main>
        }
      />
      <Route
        path="/settings"
        element={
          <main className="appContainer">
            <SideBar />
            <Settings />
          </main>
        }
      />
    </Routes>
    </AuthProvider>
      );
}

export default App;
