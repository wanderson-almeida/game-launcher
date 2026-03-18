import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <>
      <nav>
        <div className="nav-container">
          <div className="logo">
            <img src="/logo.png" alt="Logo do site" />
          </div>
          <ul>
            <li>
              <Link to="/catalogo">Catálogo</Link>
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
    </>
  );
}

export default App;