import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Catalogo from "./components/Pages/Catalogo";
import Biblioteca from "./components/Pages/Biblioteca";
import Perfil from "./components/Pages/Perfil";


function App() {
  return (
    <Router>
      <nav>
        <div className="nav-container">
          <div className="logo">
            <img src="/logo.png" alt="Logo do site" />
          </div>
          <ul>
            <li>
              <Link to="/">Catálogo</Link>
            </li>
            <li>
              <Link to="/biblioteca">Biblioteca</Link>
            </li>
            <li>
              <Link to="/perfil">Perfil</Link>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </Router>
  );
}

export default App;