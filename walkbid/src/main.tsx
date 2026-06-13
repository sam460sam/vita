import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { bootstrap } from './services/bootstrap';
import { initNative } from './platform/native';
import { startAiQueueFlush } from './services/ai';
import './styles/index.css';

// Seed singletons + price book, flip overdue payments, then start the native
// shell. All offline; nothing blocks first paint.
void bootstrap();
void initNative();
startAiQueueFlush();

// Dev-only demo seeder for marketing screenshots (excluded from prod builds).
if (import.meta.env.DEV) void import('./services/demoSeed');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
