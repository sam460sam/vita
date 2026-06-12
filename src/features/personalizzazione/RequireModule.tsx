import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { ModuleId } from '@/data/types';
import { useModules } from './prefs';
import { useIsPro } from '@/premium/premium';
import { ProGate } from '@/premium/SubscriptionGate';
import { PRO_MODULES } from '@/premium/config';

/** Route guard: a disabled module redirects to Home; a Pro module shows the
 *  paywall when the user isn't subscribed. */
export function RequireModule({ id, children }: { id: ModuleId; children: ReactNode }) {
  const { enabled, loading } = useModules();
  const isPro = useIsPro();
  if (loading) return null;
  if (!enabled.includes(id)) return <Navigate to="/oggi" replace />;
  if (PRO_MODULES.includes(id) && !isPro) return <ProGate>{children}</ProGate>;
  return <>{children}</>;
}
