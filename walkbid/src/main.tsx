import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { bootstrap } from './services/bootstrap';
import { initNative } from './platform/native';
import './styles/index.css';

// Seed singletons + price book, flip overdue payments, then start the native
// shell. All offline; nothing blocks first paint.
void bootstrap();
void initNative();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
