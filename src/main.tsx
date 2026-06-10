import React from 'react';
import ReactDOM from 'react-dom/client';
import { CantieriApp as App } from './app/CantieriApp';
import { ensureSeedRows } from './data/repo';
import { initNative } from './platform/native';
import { platform } from './platform/platform';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import './styles/index.css';

// Ensure singleton rows (settings, budget) exist before first render so that
// liveQuery reads stay strictly read-only.
void ensureSeedRows();

// Ask the browser to keep our local data durable (no account/server — this is
// what stops IndexedDB from being evicted on installed PWAs).
void platform.persistStorage();

// Configure native shell (status bar, splash, back button). No-op on web.
void initNative();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
