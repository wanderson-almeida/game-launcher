import {Link, Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <nav>
        <div className="nav-container">
          <div className="logo">
            <Link to= "/"><img src="./src/assets/logo.png" alt="Logo do site" /></Link>
          </div>
          <ul>
            <li>
              <Link to="/catalogo">Catálogo</Link>
            </li>
            <li>
              <Link to="/biblioteca">Biblioteca</Link>
            </li>
            
          </ul>
        </div>
      </nav>

      <Outlet/>
    </>
  );
}

export default App;