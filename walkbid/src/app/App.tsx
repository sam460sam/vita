import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/ui';
import { ErrorBoundary } from './ErrorBoundary';
import { TabBar } from './TabBar';
import { QuickAddProvider } from './QuickAdd';
import { JobsPage } from '@/features/jobs';
import { ClientsPage } from '@/features/clients';

const ProjectDetailPage = lazy(() => import('@/features/projects').then((m) => ({ default: m.ProjectDetailPage })));
const PriceBookPage = lazy(() => import('@/features/priceBook').then((m) => ({ default: m.PriceBookPage })));
const SettingsPage = lazy(() => import('@/features/settings').then((m) => ({ default: m.SettingsPage })));

export function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <HashRouter>
          <QuickAddProvider>
            <ErrorBoundary>
              <Suspense fallback={<div className="min-h-screen bg-asphalt" />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/jobs" replace />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:id" element={<ProjectDetailPage />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/price-book" element={<PriceBookPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/jobs" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <TabBar />
          </QuickAddProvider>
        </HashRouter>
      </ToastProvider>
    </I18nProvider>
  );
}
