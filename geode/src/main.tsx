import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { initNative } from './platform/native';
import { platform } from './platform/platform';
import './styles/index.css';

// Keep IndexedDB durable (the collection lives only on-device).
void platform.persistStorage();

// Configure native shell (status bar, splash). No-op on web.
void initNative();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
