
import './themes/global.css';

import { Routes, Route } from "react-router-dom";
import { SideBar } from "./components/SideBar/SideBar";
import { Dashboard } from "./pages/Dashboard/Dashboard";


function App() {
   return (
    <>
    <main className="appContainer">
    <SideBar />

    <Routes>
      <Route path="/" element={<Dashboard />} />
      
    </Routes>
    </main>
    </>
  );
}


export default App
