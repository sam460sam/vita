import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { it as dfnIt, enUS as dfnEn, es as dfnEs, fr as dfnFr, de as dfnDe, nl as dfnNl } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { it } from './it';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { nl } from './nl';
import { setActiveLang } from '@/lib/format';
import type { Lang, LangPref } from './types';
import type { TKey } from './it';

export type { Lang, LangPref } from './types';
export { LANGS } from './types';
export type { TKey } from './it';

const DICTS: Record<Lang, Partial<Record<TKey, string>>> = { it, en, es, fr, de, nl };
const DFN_LOCALES: Record<Lang, Locale> = { it: dfnIt, en: dfnEn, es: dfnEs, fr: dfnFr, de: dfnDe, nl: dfnNl };
const STORAGE_KEY = 'vita.lang';

/** Detect the device language, defaulting to English for unsupported locales. */
function detectDeviceLang(): Lang {
  const nav = (navigator.language || (navigator.languages && navigator.languages[0]) || 'en').toLowerCase();
  if (nav.startsWith('it')) return 'it';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('de')) return 'de';
  if (nav.startsWith('nl')) return 'nl';
  return 'en';
}

function resolveLang(pref: LangPref): Lang {
  return pref === 'system' ? detectDeviceLang() : pref;
}

const VALID: LangPref[] = ['system', 'it', 'en', 'es', 'fr', 'de', 'nl'];
function loadPref(): LangPref {
  const v = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as LangPref | null;
  return v && VALID.includes(v) ? v : 'system';
}

interface I18nCtx {
  lang: Lang;
  pref: LangPref;
  setPref: (p: LangPref) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  dfnLocale: Locale;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<LangPref>(loadPref);
  const lang = resolveLang(pref);

  // Keep plain (non-React) date/number formatters in sync with the UI language.
  setActiveLang(lang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setPref = useCallback((p: LangPref) => {
    setPrefState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
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

  const value = useMemo<I18nCtx>(() => ({ lang, pref, setPref, t, dfnLocale: DFN_LOCALES[lang] }), [lang, pref, setPref, t]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/** Convenience hook returning just the translate function. */
export function useT() {
  return useI18n().t;
}
