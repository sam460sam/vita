// ============================================================================
// Workout file import — Strava / Garmin (.tcx, .gpx) and Apple Health export
// (.xml). Runs fully in the browser (DOMParser); no server needed.
// Returns normalized partial workouts ready for createWorkout().
// ============================================================================
import type { DataSource, Workout } from '@/data/types';
import { SPORTS } from './sports';

export interface ParsedWorkout {
  sportId: string;
  startedAt: number;
  durationSec: number;
  activeKcal: number;
  totalKcal?: number;
  distanceM?: number;
  avgHr?: number;
  maxHr?: number;
  source: DataSource;
}

const SPORT_IDS = new Set(SPORTS.map((s) => s.id));
export function toSportId(raw: string): string {
  const s = raw.toLowerCase();
  const map: Record<string, string> = {
    running: 'run_outdoor',
    run: 'run_outdoor',
    trail: 'run_outdoor',
    walking: 'walk_outdoor',
    walk: 'walk_outdoor',
    hiking: 'hiking',
    biking: 'bike_outdoor',
    cycling: 'bike_outdoor',
    ride: 'bike_outdoor',
    swimming: 'swim_pool',
    swim: 'swim_pool',
    strength: 'strength',
    strengthtraining: 'strength',
    functionalstrengthtraining: 'functional',
    traditionalstrengthtraining: 'strength',
    yoga: 'yoga',
    pilates: 'pilates',
    hiit: 'hiit',
    highintensityintervaltraining: 'hiit',
    elliptical: 'elliptical',
    rowing: 'rower',
    coretraining: 'core',
    dance: 'dance',
    tennis: 'tennis',
    soccer: 'football',
    basketball: 'basket',
    boxing: 'boxing',
    skiing: 'ski',
    downhillskiing: 'ski',
    crosscountryskiing: 'ski',
    snowboarding: 'snowboard',
    flexibility: 'yoga',
    stretching: 'yoga',
    cooldown: 'yoga',
    mindandbody: 'yoga',
    climbing: 'climbing',
    golf: 'golf',
    volleyball: 'volley',
    badminton: 'badminton',
    tabletennis: 'pingpong',
    martialarts: 'martial',
    kickboxing: 'kickboxing',
    jumprope: 'cardio',
    stairclimbing: 'stair',
    stairs: 'stair',
    mixedcardio: 'cardio',
    cardio: 'cardio',
    skatingsports: 'skating',
    paddlesports: 'paddle',
    surfingsports: 'surf',
    waterpolo: 'waterpolo',
    rugby: 'rugby',
    squash: 'squash',
    pickleball: 'pickleball',
  };
  // Apple types like "HKWorkoutActivityTypeRunning"
  const cleaned = s.replace('hkworkoutactivitytype', '').replace(/[^a-z]/g, '');
  if (map[cleaned]) return map[cleaned];
  if (SPORT_IDS.has(s)) return s;
  return 'other';
}

function num(v: string | null | undefined): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Detect format and parse. Returns [] if nothing recognized. */
export function parseWorkoutFile(text: string): ParsedWorkout[] {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) return [];

  if (doc.querySelector('TrainingCenterDatabase, Activities')) return parseTcx(doc);
  if (doc.querySelector('gpx, trk')) return parseGpx(doc);
  if (doc.querySelector('HealthData, Workout')) return parseAppleHealth(doc);
  return [];
}

function parseTcx(doc: Document): ParsedWorkout[] {
  const out: ParsedWorkout[] = [];
  doc.querySelectorAll('Activity').forEach((act) => {
    const sport = act.getAttribute('Sport') ?? 'other';
    const id = act.querySelector('Id')?.textContent ?? '';
    // Fall back to the first Lap's StartTime when <Id> is missing/invalid.
    const lapStart = act.querySelector('Lap')?.getAttribute('StartTime') ?? '';
    const start = Date.parse(id) || Date.parse(lapStart) || Date.now();
    let durationSec = 0;
    let distanceM = 0;
    let kcal = 0;
    const hrAvgs: number[] = [];
    const hrMaxs: number[] = [];
    act.querySelectorAll('Lap').forEach((lap) => {
      durationSec += num(lap.querySelector('TotalTimeSeconds')?.textContent) ?? 0;
      distanceM += num(lap.querySelector('DistanceMeters')?.textContent) ?? 0;
      kcal += num(lap.querySelector('Calories')?.textContent) ?? 0;
      const avg = num(lap.querySelector('AverageHeartRateBpm > Value')?.textContent);
      const mx = num(lap.querySelector('MaximumHeartRateBpm > Value')?.textContent);
      if (avg) hrAvgs.push(avg);
      if (mx) hrMaxs.push(mx);
    });
    if (durationSec <= 0) return;
    out.push({
      sportId: toSportId(sport),
      startedAt: start,
      durationSec: Math.round(durationSec),
      activeKcal: Math.round(kcal),
      totalKcal: kcal ? Math.round(kcal * 1.25) : undefined,
      distanceM: distanceM ? Math.round(distanceM) : undefined,
      avgHr: hrAvgs.length ? Math.round(hrAvgs.reduce((a, b) => a + b, 0) / hrAvgs.length) : undefined,
      maxHr: hrMaxs.length ? Math.max(...hrMaxs) : undefined,
      source: 'manual',
    });
  });
  return out;
}

/** Find a heart-rate value inside a trackpoint's extensions (Garmin/Strava use
 *  namespaced tags like gpxtpx:hr or ns3:hr — match by local name). */
function gpxHr(pt: Element): number | undefined {
  for (const el of Array.from(pt.getElementsByTagName('*'))) {
    if (el.localName?.toLowerCase() === 'hr') {
      const v = num(el.textContent);
      if (v) return v;
    }
  }
  return undefined;
}

function parseGpx(doc: Document): ParsedWorkout[] {
  const pts = Array.from(doc.querySelectorAll('trkpt'));
  if (pts.length < 2) return [];
  let distanceM = 0;
  let prev: { lat: number; lon: number } | null = null;
  const times: number[] = [];
  const hrs: number[] = [];
  for (const p of pts) {
    const lat = num(p.getAttribute('lat'));
    const lon = num(p.getAttribute('lon'));
    const time = Date.parse(p.querySelector('time')?.textContent ?? '');
    if (Number.isFinite(time)) times.push(time);
    const hr = gpxHr(p);
    if (hr) hrs.push(hr);
    if (lat != null && lon != null) {
      if (prev) distanceM += haversine(prev.lat, prev.lon, lat, lon);
      prev = { lat, lon };
    }
  }
  if (times.length < 2) return [];
  const start = Math.min(...times);
  const durationSec = Math.round((Math.max(...times) - start) / 1000);
  if (durationSec <= 0) return [];
  const sportRaw = doc.querySelector('trk > type')?.textContent ?? 'other';
  // Rough kcal estimate when none provided (~0.06 kcal/m walking-ish).
  const kcal = Math.round(distanceM * 0.06);
  return [
    {
      sportId: toSportId(sportRaw),
      startedAt: start,
      durationSec,
      activeKcal: kcal,
      distanceM: Math.round(distanceM),
      avgHr: hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : undefined,
      maxHr: hrs.length ? Math.max(...hrs) : undefined,
      source: 'manual',
    },
  ];
}

function parseAppleHealth(doc: Document): ParsedWorkout[] {
  const out: ParsedWorkout[] = [];
  doc.querySelectorAll('Workout').forEach((w) => {
    const type = w.getAttribute('workoutActivityType') ?? 'other';
    const start = Date.parse((w.getAttribute('startDate') ?? '').replace(' +', '+')) || Date.now();
    let durationSec = (num(w.getAttribute('duration')) ?? 0) * 60; // duration is in minutes
    if ((w.getAttribute('durationUnit') ?? 'min') === 'sec') durationSec = num(w.getAttribute('duration')) ?? 0;
    const dist = num(w.getAttribute('totalDistance'));
    const distUnit = (w.getAttribute('totalDistanceUnit') ?? 'km').toLowerCase();
    const distM = dist != null ? Math.round(dist * (distUnit.startsWith('mi') ? 1609.34 : 1000)) : undefined;
    const kcal = num(w.getAttribute('totalEnergyBurned'));
    if (durationSec <= 0) return;
    out.push({
      sportId: toSportId(type),
      startedAt: start,
      durationSec: Math.round(durationSec),
      activeKcal: Math.round(kcal ?? 0),
      totalKcal: kcal ? Math.round(kcal * 1.25) : undefined,
      distanceM: distM,
      source: 'healthkit',
    });
  });
  return out;
}

export type { Workout };
