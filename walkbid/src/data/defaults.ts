import type { Settings } from './types';
import { now } from './db';

export function defaultSettings(): Settings {
  const t = now();
  return {
    id: 'app',
    company: {
      name: '',
      licenseNumber: '',
      address: '',
      phone: '',
      email: '',
      paymentInstructions: '',
    },
    defaultTaxRate: 0, // sales-tax treatment of construction varies by state
    defaultMarkupRate: 0,
    language: 'en',
    aiMode: 'mock', // P2 default; AI buttons stay hidden until P2 ships
    createdAt: t,
    updatedAt: t,
  };
}
