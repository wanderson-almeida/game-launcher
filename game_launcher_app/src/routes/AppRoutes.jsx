import { Routes, Route } from "react-router-dom";

import App from "../pages/App";
import Catalogo from "../pages/Catalogo";
import Biblioteca from "../pages/Biblioteca";

import Home from "../pages/Home"


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} >
      <Route index element = {<Home/>} />
      <Route path="catalogo" element={<Catalogo />} />
      <Route path="biblioteca" element={<Biblioteca />} />
      
      </Route>
    </Routes>
  );
}
 


export default AppRoutes;