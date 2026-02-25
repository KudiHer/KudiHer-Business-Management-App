
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
