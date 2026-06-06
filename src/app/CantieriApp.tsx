import { Suspense, lazy, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/ui';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme/theme';
import { RouteErrorBoundary } from './ErrorBoundary';
import { CantieriTabBar } from './CantieriTabBar';
import { OnboardingScreen } from '@/features/cantiere/OnboardingScreen';

// Eager
import { CantierePage, CantiereDetail, OperaiPage } from '@/features/cantiere';

// Lazy
const PrivacyPage = lazy(() => import('@/features/cantiere/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TerminiPage = lazy(() => import('@/features/cantiere/TerminiPage').then((m) => ({ default: m.TerminiPage })));
const InfoPage = lazy(() => import('@/features/cantiere/InfoPage').then((m) => ({ default: m.InfoPage })));

export function CantieriApp() {
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('cantieri.onboarded'));

  function completeOnboarding() {
    localStorage.setItem('cantieri.onboarded', '1');
    setOnboarded(true);
  }

  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <HashRouter>
            {!onboarded && <OnboardingScreen onDone={completeOnboarding} />}
            <div className="min-h-screen flex flex-col bg-section">
              <main className="flex-1 min-w-0">
                <RouteErrorBoundary>
                  <Suspense fallback={<div className="p-8 text-center text-ink-3" />}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/cantiere" replace />} />
                      <Route path="/cantiere" element={<CantierePage />} />
                      <Route path="/cantiere/operai" element={<OperaiPage />} />
                      <Route path="/cantiere/:id" element={<CantiereDetail />} />
                      <Route path="/info" element={<InfoPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/termini" element={<TerminiPage />} />
                      <Route path="*" element={<Navigate to="/cantiere" replace />} />
                    </Routes>
                  </Suspense>
                </RouteErrorBoundary>
              </main>
              <CantieriTabBar />
            </div>
          </HashRouter>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
