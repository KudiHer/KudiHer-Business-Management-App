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
    </Routes>
    </AuthProvider>
      );
}

export default App;
