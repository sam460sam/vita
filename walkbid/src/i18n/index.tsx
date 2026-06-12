import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type TKey } from './en';
import { es } from './es';
import type { Locale } from '@/data/types';
import { setActiveLocale } from '@/lib/format';

export type { TKey } from './en';

const DICTS: Record<Locale, Partial<Record<TKey, string>>> = { en, es };
const STORAGE_KEY = 'walkbid.lang';

/** English default. Spanish only when explicitly chosen or device is Spanish. */
function detectLocale(): Locale {
  const nav = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function loadLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'es') return v;
  } catch {
    /* ignore */
  }
  return detectLocale();
}

interface I18nCtx {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>(loadLocale);

  setActiveLocale(lang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => {
      let s: string = DICTS[lang][key] ?? en[key] ?? key;
      if (vars) for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]));
      return s;
    },
    [lang],
  );

  const value = useMemo<I18nCtx>(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
