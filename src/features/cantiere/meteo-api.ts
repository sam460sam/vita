const WMO: Record<number, string> = {
  0: 'sereno', 1: 'sereno',
  2: 'poco_nuvoloso',
  3: 'coperto',
  45: 'nuvoloso', 48: 'nuvoloso',
  51: 'pioggia', 53: 'pioggia', 55: 'pioggia',
  56: 'pioggia', 57: 'pioggia',
  61: 'pioggia', 63: 'pioggia', 65: 'pioggia',
  66: 'pioggia', 67: 'pioggia',
  71: 'neve',    73: 'neve',    75: 'neve',    77: 'neve',
  80: 'pioggia', 81: 'pioggia', 82: 'pioggia',
  85: 'neve',    86: 'neve',
  95: 'temporale', 96: 'temporale', 99: 'temporale',
};

const WMO_EMOJI: Record<string, string> = {
  sereno: '☀️',
  poco_nuvoloso: '⛅',
  nuvoloso: '🌤️',
  coperto: '☁️',
  pioggia: '🌧️',
  neve: '❄️',
  temporale: '⛈️',
  vento: '💨',
};

export type GettoCond = 'ottimale' | 'attenzione' | 'non_colare';

export interface MeteoData {
  meteoKey: string;
  emoji: string;
  temperatura: number;   // °C attuale
  vento: number;         // km/h
  getto: GettoCond;
}

export interface MeteoGiornata {
  data: string;           // YYYY-MM-DD
  meteoKey: string;
  emoji: string;
  tempMin: number;
  tempMax: number;
  pioggiaMm: number;
  ventoMaxKmh: number;
  getto: GettoCond;
}

export function valutaGetto(tempC: number, pioggiaMm: number, ventoKmh: number): GettoCond {
  if (tempC < 5 || tempC > 35 || pioggiaMm > 0.5) return 'non_colare';
  if (tempC < 10 || tempC > 30 || pioggiaMm > 0.1 || ventoKmh > 30) return 'attenzione';
  return 'ottimale';
}

export async function fetchMeteoCompleto(lat: number, lon: number): Promise<{
  current: MeteoData;
  giorni: MeteoGiornata[];
} | null> {
  try {
    const wxResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=weather_code,temperature_2m,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
      `&wind_speed_unit=kmh&timezone=Europe%2FRome&forecast_days=4`,
    );
    if (!wxResp.ok) return null;
    const wx: {
      current: { weather_code: number; temperature_2m: number; wind_speed_10m: number };
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
      };
    } = await wxResp.json();

    const { weather_code, temperature_2m, wind_speed_10m } = wx.current;
    let meteoKey = WMO[weather_code] ?? 'poco_nuvoloso';
    if (wind_speed_10m > 40 && meteoKey !== 'temporale') meteoKey = 'vento';

    const current: MeteoData = {
      meteoKey,
      emoji: WMO_EMOJI[meteoKey] ?? '🌤️',
      temperatura: Math.round(temperature_2m),
      vento: Math.round(wind_speed_10m),
      getto: valutaGetto(temperature_2m, 0, wind_speed_10m),
    };

    const giorni: MeteoGiornata[] = wx.daily.time.map((data, i) => {
      const wc = wx.daily.weather_code[i];
      let key = WMO[wc] ?? 'poco_nuvoloso';
      const v = wx.daily.wind_speed_10m_max[i] ?? 0;
      if (v > 40 && key !== 'temporale') key = 'vento';
      const p = wx.daily.precipitation_sum[i] ?? 0;
      const tMax = wx.daily.temperature_2m_max[i] ?? 20;
      const tMin = wx.daily.temperature_2m_min[i] ?? 10;
      return {
        data,
        meteoKey: key,
        emoji: WMO_EMOJI[key] ?? '🌤️',
        tempMin: Math.round(tMin),
        tempMax: Math.round(tMax),
        pioggiaMm: Math.round(p * 10) / 10,
        ventoMaxKmh: Math.round(v),
        getto: valutaGetto(tMax, p, v),
      };
    });

    return { current, giorni };
  } catch {
    return null;
  }
}

// Treviso fallback coords
const TV_COORDS = { lat: 45.67, lon: 12.24 };

export async function getMeteoLocation(): Promise<{ lat: number; lon: number }> {
  try {
    const cached = sessionStorage.getItem('getto.meteo.coords');
    if (cached) {
      const p = JSON.parse(cached);
      if (Date.now() - p.ts < 30 * 60 * 1000) return { lat: p.lat, lon: p.lon };
    }
  } catch { /* ignore */ }

  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(TV_COORDS); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        try {
          sessionStorage.setItem('getto.meteo.coords', JSON.stringify({ ...coords, ts: Date.now() }));
        } catch { /* ignore */ }
        resolve(coords);
      },
      () => resolve(TV_COORDS),
      { timeout: 5000, maximumAge: 60 * 60 * 1000 },
    );
  });
}

// Legacy — used by GiornaleSheet for address-based weather
export async function fetchMeteoPerIndirizzo(indirizzo: string): Promise<{
  meteoKey: string;
  temperatura: number;
  vento: number;
} | null> {
  try {
    const geoResp = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(indirizzo + ', Italia')}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'it' } },
    );
    const geoData: Array<{ lat: string; lon: string }> = await geoResp.json();
    if (!geoData.length) return null;
    const { lat, lon } = geoData[0];

    const wxResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=weather_code,temperature_2m,wind_speed_10m&wind_speed_unit=kmh&timezone=Europe%2FRome`,
    );
    const wxData: {
      current: { weather_code: number; temperature_2m: number; wind_speed_10m: number };
    } = await wxResp.json();

    const { weather_code, temperature_2m, wind_speed_10m } = wxData.current;
    let meteoKey = WMO[weather_code] ?? 'poco_nuvoloso';
    if (wind_speed_10m > 40 && meteoKey !== 'temporale') meteoKey = 'vento';
    return { meteoKey, temperatura: Math.round(temperature_2m), vento: Math.round(wind_speed_10m) };
  } catch {
    return null;
  }
}
