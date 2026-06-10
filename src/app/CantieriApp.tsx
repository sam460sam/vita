import { Suspense, lazy, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/ui';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme/theme';
import { RouteErrorBoundary } from './ErrorBoundary';
import { CantieriTabBar } from './CantieriTabBar';
import { OnboardingScreen } from '@/features/cantiere/OnboardingScreen';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { LoginPage } from '@/features/auth/LoginPage';
import type { MioProfilo } from '@/features/cantiere/profiloRepo';

// Eager
import { CantierePage, CantiereDetail, OperaiPage, ImpiantiPage } from '@/features/cantiere';

// Lazy
const PrivacyPage = lazy(() => import('@/features/cantiere/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TerminiPage = lazy(() => import('@/features/cantiere/TerminiPage').then((m) => ({ default: m.TerminiPage })));
const InfoPage = lazy(() => import('@/features/cantiere/InfoPage').then((m) => ({ default: m.InfoPage })));
const OrePage = lazy(() => import('@/features/ore/OrePage').then((m) => ({ default: m.OrePage })));
const NotePage = lazy(() => import('@/features/note/NotePage').then((m) => ({ default: m.NotePage })));

function AppShell() {
  const { user, loading } = useAuth();
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('cantieri.onboarded'));

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  function completeOnboarding(_profilo: MioProfilo) {
    localStorage.setItem('cantieri.onboarded', '1');
    setOnboarded(true);
  }

  return (
    <>
      {!onboarded && <OnboardingScreen onDone={completeOnboarding} />}
      <div className="min-h-screen flex flex-col bg-section">
        <main className="flex-1 min-w-0">
          <RouteErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center text-ink-3" />}>
              <Routes>
                <Route path="/" element={<Navigate to="/cantiere" replace />} />
                <Route path="/cantiere" element={<CantierePage />} />
                <Route path="/cantiere/operai" element={<OperaiPage />} />
                <Route path="/cantiere/impianti" element={<ImpiantiPage />} />
                <Route path="/cantiere/:id" element={<CantiereDetail />} />
                <Route path="/ore/*" element={<OrePage />} />
                <Route path="/note/*" element={<NotePage />} />
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
    </>
  );
}

export function CantieriApp() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <HashRouter>
              <AppShell />
            </HashRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
