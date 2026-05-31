import type { Settings } from './types';
import { now } from './db';

export function defaultSettings(): Settings {
  const t = now();
  return {
    id: 'app',
    name: '',
    goals: { moveKcal: 600, exerciseMin: 30, standHours: 12 },
    modules: { goals: true, finances: true, calendar: true },
    currency: 'EUR',
    water: { dailyGoalMl: 2000, glassMl: 200 },
    createdAt: t,
    updatedAt: t,
  };
}
