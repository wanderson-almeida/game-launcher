import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import AppRoutes from './routes/AppRoutes.jsx';
import './index.css';
import SaveExePath from './test/saveExePath.jsx';
import SearchGames from './test/SearchGame.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
