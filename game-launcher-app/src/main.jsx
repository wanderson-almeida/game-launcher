import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import HomePage from './pages/HomePage.jsx';
import SaveExePath from './test/saveExePath.jsx';
import SearchGames from './test/SearchGame.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchGames />
  </StrictMode>,
)
