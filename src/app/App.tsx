import { Suspense, lazy, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/ui';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme/theme';
import { PremiumProvider } from '@/premium/premium';
import { QuickAddProvider } from './QuickAdd';
import { StellaProvider } from '@/features/stella';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { GlobalSheets } from './GlobalSheets';
import { Onboarding, hasOnboarded } from '@/features/onboarding/Onboarding';

// Core modules — eager (part of the primary experience).
import { TodayPage } from '@/features/oggi';
import { ActivityPage } from '@/features/attivita';
import { ProjectsPage, ProjectDetailPage } from '@/features/progetti';
import { HabitsPage } from '@/features/abitudini';
import { MorePage } from '@/features/altro';

// Secondary modules — lazy (loaded on demand, keeps initial bundle slim).
const JournalPage = lazy(() => import('@/features/diario').then((m) => ({ default: m.JournalPage })));
const GoalsPage = lazy(() => import('@/features/obiettivi').then((m) => ({ default: m.GoalsPage })));
const FinancesPage = lazy(() => import('@/features/finanze').then((m) => ({ default: m.FinancesPage })));
const CalendarPage = lazy(() => import('@/features/calendario').then((m) => ({ default: m.CalendarPage })));
const SettingsPage = lazy(() => import('@/features/impostazioni/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProPage = lazy(() => import('@/features/pro').then((m) => ({ default: m.ProPage })));
const WeightPage = lazy(() => import('@/features/peso').then((m) => ({ default: m.WeightPage })));
const BmiPage = lazy(() => import('@/features/peso').then((m) => ({ default: m.BmiPage })));
const RecapPage = lazy(() => import('@/features/recap').then((m) => ({ default: m.RecapPage })));
const GamificationPage = lazy(() => import('@/features/gamification').then((m) => ({ default: m.GamificationPage })));

export function App() {
  const [onboarded, setOnboarded] = useState(hasOnboarded());

  return (
    <I18nProvider>
      <ThemeProvider>
      <PremiumProvider>
        <ToastProvider>
          {/* HashRouter keeps deep-links working from static assets (Capacitor-ready). */}
          <HashRouter>
            <QuickAddProvider>
            <StellaProvider>
              <div className="min-h-screen flex bg-section">
                <Sidebar />
                <main className="flex-1 min-w-0">
                  <Suspense fallback={<div className="p-8 text-center text-ink-3" />}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/oggi" replace />} />
                      <Route path="/oggi" element={<TodayPage />} />
                      <Route path="/attivita" element={<ActivityPage />} />
                      <Route path="/peso" element={<WeightPage />} />
                      <Route path="/bmi" element={<BmiPage />} />
                      <Route path="/recap" element={<RecapPage />} />
                      <Route path="/premi" element={<GamificationPage />} />
                      <Route path="/progetti" element={<ProjectsPage />} />
                      <Route path="/progetti/:id" element={<ProjectDetailPage />} />
                      <Route path="/abitudini" element={<HabitsPage />} />
                      <Route path="/diario" element={<JournalPage />} />
                      <Route path="/obiettivi" element={<GoalsPage />} />
                      <Route path="/finanze" element={<FinancesPage />} />
                      <Route path="/calendario" element={<CalendarPage />} />
                      <Route path="/altro" element={<MorePage />} />
                      <Route path="/pro" element={<ProPage />} />
                      <Route path="/impostazioni" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/oggi" replace />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
              <TabBar />
              <GlobalSheets />
            </StellaProvider>
            </QuickAddProvider>
          </HashRouter>
          {!onboarded && <Onboarding onDone={() => setOnboarded(true)} />}
        </ToastProvider>
      </PremiumProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
