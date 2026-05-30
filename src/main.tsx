import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { ensureSeedRows } from './data/repo';
import './styles/index.css';

// Ensure singleton rows (settings, budget) exist before first render so that
// liveQuery reads stay strictly read-only.
void ensureSeedRows();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
