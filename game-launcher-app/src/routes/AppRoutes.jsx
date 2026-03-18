import { Routes, Route } from "react-router-dom";

import App from "../pages/App";
import Catalogo from "../pages/Catalogo";
import Biblioteca from "../pages/Biblioteca";
import Perfil from "../pages/Perfil";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
        <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/biblioteca" element={<Biblioteca />} />
      <Route path="/perfil" element={<Perfil />} />
    </Routes>
  );
}
 


export default AppRoutes;