import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { Sheet } from '@/ui';

// ── Types ─────────────────────────────────────────────────────

interface PlaceResult {
  label: string;      // primary display text
  sub: string;        // secondary (city / country)
  address: string;    // full formatted address to write to form
  lat?: number;
  lon?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (address: string, lat?: number, lon?: number) => void;
  initialValue?: string;
}

// ── Nominatim (OpenStreetMap) ─────────────────────────────────

async function searchNominatim(q: string): Promise<PlaceResult[]> {
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}` +
    `&format=json&addressdetails=1&limit=6&countrycodes=it`,
    { headers: { 'Accept-Language': 'it', 'User-Agent': 'GettoPWA/1.0' } },
  );
  const data: Array<{
    display_name: string;
    address: {
      road?: string; house_number?: string; city?: string; town?: string;
      village?: string; state?: string; postcode?: string;
    };
    lat: string; lon: string;
  }> = await resp.json();

  return data.map((r) => {
    const a = r.address;
    const road = [a.road, a.house_number].filter(Boolean).join(' ');
    const city = a.city ?? a.town ?? a.village ?? '';
    const label = road || city || r.display_name.split(',')[0];
    const sub = [city, a.state].filter(Boolean).join(', ') || r.display_name;
    const address = [road, a.postcode, city].filter(Boolean).join(', ');
    return { label, sub, address: address || r.display_name, lat: Number(r.lat), lon: Number(r.lon) };
  });
}

// ── Google Places (only if key is configured) ─────────────────

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined;
let mapsLoaded = false;
let mapsLoading = false;
const mapsCallbacks: Array<() => void> = [];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (mapsLoaded) { resolve(); return; }
    mapsCallbacks.push(resolve);
    if (mapsLoading) return;
    mapsLoading = true;
    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}` +
      `&libraries=places&language=it&region=IT&callback=__gmapsReady`;
    (window as unknown as Record<string, unknown>)['__gmapsReady'] = () => {
      mapsLoaded = true;
      mapsCallbacks.forEach((cb) => cb());
      mapsCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

type GoogleAutocomplete = {
  getPlacePredictions(
    req: { input: string; componentRestrictions: { country: string } },
    cb: (results: GooglePrediction[] | null, status: string) => void,
  ): void;
};
type GoogleGeocoder = {
  geocode(
    req: { placeId: string },
    cb: (results: GoogleGeoResult[] | null, status: string) => void,
  ): void;
};
type GooglePrediction = {
  place_id: string;
  structured_formatting: { main_text: string; secondary_text: string };
  description: string;
};
type GoogleGeoResult = {
  geometry: { location: { lat(): number; lng(): number } };
  formatted_address: string;
};

let autocompleteService: GoogleAutocomplete | null = null;
let geocoderService: GoogleGeocoder | null = null;

async function searchGoogle(q: string): Promise<PlaceResult[]> {
  await loadGoogleMaps();
  const g = window as unknown as {
    google?: { maps?: {
      places?: { AutocompleteService: new () => GoogleAutocomplete };
      Geocoder?: new () => GoogleGeocoder;
    } };
  };
  if (!g.google?.maps?.places) return [];
  autocompleteService ??= new g.google.maps.places.AutocompleteService();
  return new Promise((resolve) => {
    autocompleteService!.getPlacePredictions(
      { input: q, componentRestrictions: { country: 'it' } },
      (results, status) => {
        if (status !== 'OK' || !results) { resolve([]); return; }
        resolve(results.map((r) => ({
          label: r.structured_formatting.main_text,
          sub: r.structured_formatting.secondary_text,
          address: r.description,
          placeId: r.place_id,
        })));
      },
    );
  });
}

async function geocodePlaceId(placeId: string): Promise<{ lat: number; lon: number; address: string } | null> {
  const g = window as unknown as {
    google?: { maps?: { Geocoder?: new () => GoogleGeocoder } };
  };
  if (!g.google?.maps?.Geocoder) return null;
  geocoderService ??= new g.google.maps.Geocoder();
  return new Promise((resolve) => {
    geocoderService!.geocode({ placeId }, (results, status) => {
      if (status !== 'OK' || !results?.length) { resolve(null); return; }
      const r = results[0];
      resolve({
        lat: r.geometry.location.lat(),
        lon: r.geometry.location.lng(),
        address: r.formatted_address,
      });
    });
  });
}

// ── Reverse geocode (GPS → address) ──────────────────────────

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'it', 'User-Agent': 'GettoPWA/1.0' } },
  );
  const data: { display_name: string; address?: Record<string, string> } = await resp.json();
  const a = data.address ?? {};
  const road = [a.road, a.house_number].filter(Boolean).join(' ');
  const city = a.city ?? a.town ?? a.village ?? '';
  return [road, a.postcode, city].filter(Boolean).join(', ') || data.display_name;
}

// ── Component ─────────────────────────────────────────────────

export function AddressPicker({ open, onClose, onSelect, initialValue = '' }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery(initialValue);
      setResults([]);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, initialValue]);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 3) { setResults([]); return; }
    setSearching(true);
    setError('');
    try {
      const hits = MAPS_KEY
        ? await searchGoogle(q)
        : await searchNominatim(q);
      setResults(hits);
    } catch {
      setError('Ricerca non disponibile — riprova.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doSearch(val), 380);
  }

  async function handleSelect(r: PlaceResult) {
    let finalAddress = r.address;
    let lat = r.lat;
    let lon = r.lon;

    // If from Google Places, resolve placeId for lat/lon
    if (MAPS_KEY && (r as PlaceResult & { placeId?: string }).placeId) {
      const geo = await geocodePlaceId((r as PlaceResult & { placeId?: string }).placeId!);
      if (geo) { lat = geo.lat; lon = geo.lon; finalAddress = geo.address; }
    }

    onSelect(finalAddress, lat, lon);
    onClose();
  }

  async function usaGPS() {
    if (!navigator.geolocation) {
      setError('GPS non disponibile su questo dispositivo.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const address = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          onSelect(address, pos.coords.latitude, pos.coords.longitude);
          onClose();
        } catch {
          setError('Impossibile convertire la posizione in indirizzo.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError('Posizione non autorizzata. Controlla le impostazioni GPS.');
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title="Cerca indirizzo cantiere" size="full">
      {/* Search bar */}
      <div className="flex items-center gap-2 px-1 py-1 mb-3 rounded-2xl border border-line bg-section focus-within:border-primary/50 transition-colors">
        <Search size={17} className="text-ink-3 ml-2 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Via, quartiere, città…"
          className="flex-1 bg-transparent text-[15px] text-ink placeholder-ink-3 outline-none py-2.5"
        />
        {searching && <Loader2 size={16} className="text-ink-3 mr-2 animate-spin flex-shrink-0" />}
        {query && !searching && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
            className="mr-2 text-ink-3 flex-shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* GPS button */}
      <button
        onClick={usaGPS}
        disabled={locating}
        className="w-full flex items-center gap-3 p-3.5 mb-4 rounded-2xl border border-line bg-card active:bg-section transition-colors disabled:opacity-50"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(37,99,235,0.12)' }}
        >
          {locating
            ? <Loader2 size={17} className="animate-spin" style={{ color: '#2563EB' }} />
            : <Navigation size={17} style={{ color: '#2563EB' }} />
          }
        </div>
        <div className="text-left">
          <div className="text-[14px] font-semibold text-ink">
            {locating ? 'Rilevamento posizione…' : 'Usa la mia posizione'}
          </div>
          <div className="text-[11.5px] text-ink-3 mt-0.5">GPS → indirizzo automatico</div>
        </div>
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-[12.5px] text-danger bg-danger/8 rounded-xl px-3 py-2.5 mb-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-line bg-card text-left active:bg-section transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(245,81,0,0.10)' }}
              >
                <MapPin size={16} style={{ color: 'var(--c-primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-ink leading-snug truncate">{r.label}</div>
                <div className="text-[12px] text-ink-3 mt-0.5 truncate">{r.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {query.length >= 3 && !searching && results.length === 0 && !error && (
        <div className="flex flex-col items-center py-10 text-center px-4">
          <MapPin size={28} className="text-ink-3 mb-3" />
          <p className="text-[14px] font-semibold text-ink">Nessun risultato</p>
          <p className="text-[12.5px] text-ink-3 mt-1">
            Prova con via + numero civico o nome del comune.
          </p>
        </div>
      )}

      {/* Hint when empty */}
      {query.length < 3 && results.length === 0 && (
        <p className="text-[12.5px] text-ink-3 text-center mt-4 leading-relaxed">
          Digita almeno 3 caratteri per cercare. <br />
          {MAPS_KEY ? '📍 Ricerca tramite Google Places.' : '🗺️ Ricerca tramite OpenStreetMap.'}
        </p>
      )}
    </Sheet>
  );
}
