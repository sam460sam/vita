// Maps WMO weather codes (Open-Meteo) to our internal meteo keys
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

export interface MeteoData {
  meteoKey: string;
  temperatura: number; // °C
  vento: number;       // km/h
}

export async function fetchMeteoPerIndirizzo(indirizzo: string): Promise<MeteoData | null> {
  try {
    // 1. Geocode address via Nominatim (OpenStreetMap, no API key)
    const geoResp = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(indirizzo + ', Italia')}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'it' } },
    );
    const geoData: Array<{ lat: string; lon: string }> = await geoResp.json();
    if (!geoData.length) return null;

    const { lat, lon } = geoData[0];

    // 2. Fetch current weather from Open-Meteo (free, no API key)
    const wxResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=weather_code,temperature_2m,wind_speed_10m` +
      `&wind_speed_unit=kmh&timezone=Europe%2FRome`,
    );
    const wxData: {
      current: { weather_code: number; temperature_2m: number; wind_speed_10m: number };
    } = await wxResp.json();

    const { weather_code, temperature_2m, wind_speed_10m } = wxData.current;

    let meteoKey = WMO[weather_code] ?? 'poco_nuvoloso';
    // High wind overrides (unless already stormy)
    if (wind_speed_10m > 40 && meteoKey !== 'temporale') meteoKey = 'vento';

    return {
      meteoKey,
      temperatura: Math.round(temperature_2m),
      vento: Math.round(wind_speed_10m),
    };
  } catch {
    return null;
  }
}
