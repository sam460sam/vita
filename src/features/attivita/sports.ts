// Extensible sport catalog (BUILD-SPEC §4.2). Add entries freely.
// `met` = rough metabolic equivalent used for a simple active-kcal estimate.
import type { LucideIcon } from 'lucide-react';
import {
  Footprints,
  Bike,
  Waves,
  Dumbbell,
  HeartPulse,
  Mountain,
  Activity,
  PersonStanding,
  Snowflake,
  Trophy,
  Target,
  CircleDot,
  Flower2,
  Wind,
  Anchor,
} from 'lucide-react';

export interface Sport {
  id: string;
  name: string;
  icon: LucideIcon;
  met: number;
  hasDistance?: boolean;
  hasElevation?: boolean;
}

export const SPORTS: Sport[] = [
  { id: 'run_outdoor', name: 'Corsa (outdoor)', icon: Footprints, met: 9.8, hasDistance: true, hasElevation: true },
  { id: 'run_indoor', name: 'Corsa (indoor)', icon: Footprints, met: 9.0, hasDistance: true },
  { id: 'walk_outdoor', name: 'Camminata (outdoor)', icon: PersonStanding, met: 3.8, hasDistance: true, hasElevation: true },
  { id: 'walk_indoor', name: 'Camminata (indoor)', icon: PersonStanding, met: 3.5, hasDistance: true },
  { id: 'bike_outdoor', name: 'Bici (outdoor)', icon: Bike, met: 8.0, hasDistance: true, hasElevation: true },
  { id: 'bike_indoor', name: 'Bici (indoor)', icon: Bike, met: 7.0, hasDistance: true },
  { id: 'elliptical', name: 'Ellittica', icon: Activity, met: 5.0 },
  { id: 'rower', name: 'Vogatore', icon: Anchor, met: 7.0, hasDistance: true },
  { id: 'stair', name: 'Stair Stepper', icon: Activity, met: 9.0 },
  { id: 'hiit', name: 'HIIT', icon: HeartPulse, met: 8.0 },
  { id: 'hiking', name: 'Escursionismo', icon: Mountain, met: 6.0, hasDistance: true, hasElevation: true },
  { id: 'yoga', name: 'Yoga', icon: Flower2, met: 2.5 },
  { id: 'pilates', name: 'Pilates', icon: Flower2, met: 3.0 },
  { id: 'functional', name: 'Forza funzionale', icon: Dumbbell, met: 5.0 },
  { id: 'strength', name: 'Forza tradizionale', icon: Dumbbell, met: 4.5 },
  { id: 'core', name: 'Core training', icon: Dumbbell, met: 4.0 },
  { id: 'taichi', name: 'Tai Chi', icon: Flower2, met: 3.0 },
  { id: 'swim_pool', name: 'Nuoto (piscina)', icon: Waves, met: 7.0, hasDistance: true },
  { id: 'swim_open', name: 'Nuoto (acque libere)', icon: Waves, met: 8.0, hasDistance: true },
  { id: 'cross', name: 'Cross training', icon: Activity, met: 7.5 },
  { id: 'cardio', name: 'Cardio misto', icon: HeartPulse, met: 6.5 },
  { id: 'dance', name: 'Danza', icon: Wind, met: 5.0 },
  { id: 'basket', name: 'Basket', icon: Trophy, met: 6.5 },
  { id: 'football', name: 'Calcio', icon: Trophy, met: 7.0, hasDistance: true },
  { id: 'tennis', name: 'Tennis', icon: Target, met: 7.3 },
  { id: 'padel', name: 'Padel', icon: Target, met: 6.0 },
  { id: 'pickleball', name: 'Pickleball', icon: Target, met: 5.5 },
  { id: 'badminton', name: 'Badminton', icon: Target, met: 5.5 },
  { id: 'pingpong', name: 'Ping pong', icon: CircleDot, met: 4.0 },
  { id: 'boxing', name: 'Pugilato', icon: HeartPulse, met: 9.0 },
  { id: 'kickboxing', name: 'Kickboxing', icon: HeartPulse, met: 9.5 },
  { id: 'martial', name: 'Arti marziali', icon: HeartPulse, met: 8.0 },
  { id: 'golf', name: 'Golf', icon: Target, met: 4.5, hasDistance: true },
  { id: 'climbing', name: 'Arrampicata', icon: Mountain, met: 7.5, hasElevation: true },
  { id: 'ski', name: 'Sci', icon: Snowflake, met: 7.0, hasDistance: true, hasElevation: true },
  { id: 'snowboard', name: 'Snowboard', icon: Snowflake, met: 6.5, hasElevation: true },
  { id: 'skating', name: 'Pattinaggio', icon: Activity, met: 7.0, hasDistance: true },
  { id: 'volley', name: 'Pallavolo', icon: Trophy, met: 4.5 },
  { id: 'rugby', name: 'Rugby', icon: Trophy, met: 8.0 },
  { id: 'squash', name: 'Squash', icon: Target, met: 7.3 },
  { id: 'paddle', name: 'Canottaggio/Pagaiata', icon: Anchor, met: 6.0, hasDistance: true },
  { id: 'surf', name: 'Surf', icon: Waves, met: 5.0 },
  { id: 'aqua', name: 'Fitness in acqua', icon: Waves, met: 5.5 },
  { id: 'waterpolo', name: 'Pallanuoto', icon: Waves, met: 10.0 },
  { id: 'other', name: 'Altro', icon: Activity, met: 5.0 },
];

const SPORTS_BY_ID = new Map(SPORTS.map((s) => [s.id, s]));

export function getSport(id: string): Sport {
  return SPORTS_BY_ID.get(id) ?? SPORTS[SPORTS.length - 1];
}

/** Simple active-kcal estimate from MET, duration and an assumed 70kg body. */
export function estimateKcal(met: number, durationSec: number, weightKg = 70): number {
  const hours = durationSec / 3600;
  return Math.round(met * weightKg * hours);
}
