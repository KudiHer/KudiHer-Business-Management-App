<<<<<<< HEAD

import './themes/global.css';

import { Routes, Route } from "react-router-dom";

import  Dashboard   from "./pages/Dashboard/Dashboard";


function App() {
   return (
    <>
    <main className="appContainer">
    

    <Routes>
      <Route path="/" element={<Dashboard />} />
      
    </Routes>
    </main>
    </>
  );
}


export default App
=======
import "./themes/global.css";
import { Routes, Route } from "react-router-dom";
import { SideBar } from "./components/SideBar/SideBar";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import SignIn from "./pages/SignIn/SignIn";
import BusinessSetup from "./pages/BusinessSetup/BusinessSetup";

function App() {
  return (
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
    </Routes>
  );
}

export default App;
>>>>>>> origin/main
