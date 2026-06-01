import { createContext, useContext, useState, type ReactNode } from 'react';

export type QuickAddTarget = 'task' | 'habit' | 'workout' | 'journal' | 'weight';

interface QuickAddCtx {
  /** which create sheet is open (null = none) */
  target: QuickAddTarget | null;
  /** whether the FAB action menu is open */
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  open: (t: QuickAddTarget) => void;
  close: () => void;
}

const Ctx = createContext<QuickAddCtx | null>(null);

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<QuickAddTarget | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <Ctx.Provider
      value={{
        target,
        menuOpen,
        openMenu: () => setMenuOpen(true),
        closeMenu: () => setMenuOpen(false),
        open: (t) => {
          setMenuOpen(false);
          setTarget(t);
        },
        close: () => setTarget(null),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useQuickAdd(): QuickAddCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useQuickAdd must be used within QuickAddProvider');
  return ctx;
}
