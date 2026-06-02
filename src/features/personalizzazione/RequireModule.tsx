import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { ModuleId } from '@/data/types';
import { useModules } from './prefs';

/** Route guard: a disabled module's page redirects to Home if reached by URL. */
export function RequireModule({ id, children }: { id: ModuleId; children: ReactNode }) {
  const { enabled, loading } = useModules();
  if (loading) return null;
  if (!enabled.includes(id)) return <Navigate to="/oggi" replace />;
  return <>{children}</>;
}
