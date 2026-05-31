// Supported UI languages. Add more keys here + a dictionary file to extend.
export type Lang = 'it' | 'en';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'it', label: 'Italiano' },
  { code: 'en', label: 'English' },
];

/** 'system' follows the device language; otherwise a fixed Lang. */
export type LangPref = 'system' | Lang;
