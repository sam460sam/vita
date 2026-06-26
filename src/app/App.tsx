import { Suspense, lazy, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider, PageSkeleton } from '@/ui';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme/theme';
import { PremiumProvider } from '@/premium/premium';
import { QuickAddProvider } from './QuickAdd';
import { StellaProvider } from '@/features/stella';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { GlobalSheets } from './GlobalSheets';
import { RouteErrorBoundary } from './ErrorBoundary';
import { Onboarding, hasOnboarded } from '@/features/onboarding/Onboarding';
import { BrandSplash } from './BrandSplash';

// Core modules — eager (part of the primary experience).
import { HomeDashboard } from '@/features/home';
import { TodayPage, HomeScreen } from '@/features/oggi';
import { ActivityPage } from '@/features/attivita';
import { ProjectsPage, ProjectDetailPage } from '@/features/progetti';
import { HabitsPage } from '@/features/abitudini';
import { MorePage } from '@/features/altro';
import { RequireModule } from '@/features/personalizzazione/RequireModule';

// Secondary modules — lazy (loaded on demand, keeps initial bundle slim).
const JournalPage = lazy(() => import('@/features/diario').then((m) => ({ default: m.JournalPage })));
const NotesPage = lazy(() => import('@/features/note').then((m) => ({ default: m.NotesPage })));
const WaterPage = lazy(() => import('@/features/acqua/WaterPage').then((m) => ({ default: m.WaterPage })));
const PersonalityPage = lazy(() => import('@/features/personalita').then((m) => ({ default: m.PersonalityPage })));
const GoalsPage = lazy(() => import('@/features/obiettivi').then((m) => ({ default: m.GoalsPage })));
const FinancesPage = lazy(() => import('@/features/finanze').then((m) => ({ default: m.FinancesPage })));
const CalendarPage = lazy(() => import('@/features/calendario').then((m) => ({ default: m.CalendarPage })));
const SettingsPage = lazy(() => import('@/features/impostazioni/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProPage = lazy(() => import('@/features/pro').then((m) => ({ default: m.ProPage })));
const WeightPage = lazy(() => import('@/features/peso').then((m) => ({ default: m.WeightPage })));
const BmiPage = lazy(() => import('@/features/peso').then((m) => ({ default: m.BmiPage })));
const RecapPage = lazy(() => import('@/features/recap').then((m) => ({ default: m.RecapPage })));
const ProgressPage = lazy(() => import('@/features/progress').then((m) => ({ default: m.ProgressPage })));
const RoutinesPage = lazy(() => import('@/features/routine').then((m) => ({ default: m.RoutinesPage })));
const GamificationPage = lazy(() => import('@/features/gamification').then((m) => ({ default: m.GamificationPage })));
const SearchPage = lazy(() => import('@/features/cerca/SearchPage').then((m) => ({ default: m.SearchPage })));

export function App() {
  const [onboarded, setOnboarded] = useState(hasOnboarded());

  return (
    <I18nProvider>
      <ThemeProvider>
      <BrandSplash />
      <PremiumProvider>
        <ToastProvider>
          {/* HashRouter keeps deep-links working from static assets (Capacitor-ready). */}
          <HashRouter>
            <QuickAddProvider>
            <StellaProvider>
              <div className="min-h-screen flex bg-section">
                <Sidebar />
                <main className="flex-1 min-w-0">
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                      <Route path="/" element={<Navigate to="/oggi" replace />} />
                      <Route path="/oggi" element={<HomeScreen />} />
                      <Route path="/oggi-dashboard" element={<HomeDashboard />} />
                      <Route path="/oggi-classic" element={<TodayPage />} />
                      <Route path="/attivita" element={<RequireModule id="attivita"><ActivityPage /></RequireModule>} />
                      <Route path="/peso" element={<RequireModule id="peso"><WeightPage /></RequireModule>} />
                      <Route path="/bmi" element={<BmiPage />} />
                      <Route path="/recap" element={<RecapPage />} />
                      <Route path="/progressi" element={<ProgressPage />} />
                      <Route path="/routine" element={<RoutinesPage />} />
                      <Route path="/premi" element={<GamificationPage />} />
                      <Route path="/progetti" element={<RequireModule id="progetti"><ProjectsPage /></RequireModule>} />
                      <Route path="/progetti/:id" element={<RequireModule id="progetti"><ProjectDetailPage /></RequireModule>} />
                      <Route path="/abitudini" element={<RequireModule id="abitudini"><HabitsPage /></RequireModule>} />
                      <Route path="/diario" element={<RequireModule id="diario"><JournalPage /></RequireModule>} />
                      <Route path="/note" element={<RequireModule id="note"><NotesPage /></RequireModule>} />
                      <Route path="/acqua" element={<RequireModule id="acqua"><WaterPage /></RequireModule>} />
                      <Route path="/personalita" element={<RequireModule id="personalita"><PersonalityPage /></RequireModule>} />
                      <Route path="/obiettivi" element={<RequireModule id="obiettivi"><GoalsPage /></RequireModule>} />
                      <Route path="/finanze" element={<RequireModule id="finanze"><FinancesPage /></RequireModule>} />
                      <Route path="/calendario" element={<RequireModule id="calendario"><CalendarPage /></RequireModule>} />
                      <Route path="/altro" element={<MorePage />} />
                      <Route path="/pro" element={<ProPage />} />
                      <Route path="/impostazioni" element={<SettingsPage />} />
                      <Route path="/cerca" element={<SearchPage />} />
                      <Route path="*" element={<Navigate to="/oggi" replace />} />
                      </Routes>
                    </Suspense>
                  </RouteErrorBoundary>
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
