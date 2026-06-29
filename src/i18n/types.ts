// Supported UI languages. Add more keys here + a dictionary file to extend.
export type Lang = 'it' | 'en' | 'es' | 'fr' | 'de' | 'nl';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'it', label: 'Italiano' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'nl', label: 'Nederlands' },
];

/** 'system' follows the device language; otherwise a fixed Lang. */
export type LangPref = 'system' | Lang;
