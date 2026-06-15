import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/ui';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme/theme';
import { RouteErrorBoundary } from './ErrorBoundary';
import { CantieriTabBar } from './CantieriTabBar';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { TeamProvider, useTeam } from '@/auth/TeamContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { TeamSetupScreen } from '@/features/auth/TeamSetupScreen';

// Eager — core screens
import {
  DashboardPage,
  CantierePage,
  CantiereDetail,
  OperaiPage,
  AltroPage,
  ImpiantiPage,
} from '@/features/cantiere';

// Lazy — secondary screens
const PrivacyPage = lazy(() => import('@/features/cantiere/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TerminiPage = lazy(() => import('@/features/cantiere/TerminiPage').then((m) => ({ default: m.TerminiPage })));
const InfoPage    = lazy(() => import('@/features/cantiere/InfoPage').then((m)    => ({ default: m.InfoPage })));
const OrePage     = lazy(() => import('@/features/ore/OrePage').then((m)     => ({ default: m.OrePage })));
const NotePage    = lazy(() => import('@/features/note/NotePage').then((m)    => ({ default: m.NotePage })));
const MeteoPage   = lazy(() => import('@/features/cantiere/MeteoPage').then((m)   => ({ default: m.MeteoPage })));
const FinanzePage = lazy(() => import('@/features/cantiere/FinanzePage').then((m) => ({ default: m.FinanzePage })));

function Spinner() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

function AppShell() {
  const { user, loading: authLoading } = useAuth();
  const { team, teamLoading } = useTeam();

  if (authLoading) return <Spinner />;
  if (!user) return <LoginPage />;
  if (teamLoading) return <Spinner />;
  if (!team) return <TeamSetupScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-app">
      <main className="flex-1 min-w-0">
        <RouteErrorBoundary>
          <Suspense fallback={<div className="p-8 text-center text-ink-3" />}>
            <Routes>
              {/* Dashboard — home */}
              <Route path="/" element={<DashboardPage />} />

              {/* Cantieri */}
              <Route path="/cantiere" element={<CantierePage />} />
              <Route path="/cantiere/operai" element={<OperaiPage />} />
              <Route path="/cantiere/impianti" element={<ImpiantiPage />} />
              <Route path="/cantiere/:id" element={<CantiereDetail />} />

              {/* Altro hub */}
              <Route path="/altro" element={<AltroPage />} />

              {/* Secondary */}
              <Route path="/meteo" element={<MeteoPage />} />
              <Route path="/finanze" element={<FinanzePage />} />
              <Route path="/ore/*" element={<OrePage />} />
              <Route path="/note/*" element={<NotePage />} />
              <Route path="/info" element={<InfoPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/termini" element={<TerminiPage />} />

              {/* Catch-all → dashboard */}
              <Route path="*" element={<DashboardPage />} />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </main>
      <CantieriTabBar />
    </div>
  );
}

export function CantieriApp() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <TeamProvider>
              <HashRouter>
                <AppShell />
              </HashRouter>
            </TeamProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
