import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, ChevronRight } from 'lucide-react';
import { fetchMeteoCompleto, getMeteoLocation, type MeteoData, type GettoCond } from './meteo-api';

const GETTO_CONFIG: Record<GettoCond, { label: string; color: string; bg: string; dot: string }> = {
  ottimale:    { label: 'Ottimale per gettare', color: 'var(--c-success)', bg: 'rgba(22,163,74,0.08)', dot: 'var(--c-success)' },
  attenzione:  { label: 'Attenzione — verifica', color: 'var(--c-warning)', bg: 'rgba(217,119,6,0.08)', dot: 'var(--c-warning)' },
  non_colare:  { label: 'Non colare oggi', color: 'var(--c-danger)', bg: 'rgba(220,38,38,0.08)', dot: 'var(--c-danger)' },
};

export function MeteoWidget() {
  const navigate = useNavigate();
  const [data, setData] = useState<MeteoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const coords = await getMeteoLocation();
      const result = await fetchMeteoCompleto(coords.lat, coords.lon);
      if (!cancelled) {
        if (result) setData(result.current);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !data) return null;

  const gc = GETTO_CONFIG[data.getto];

  return (
    <button
      onClick={() => navigate('/meteo')}
      className="w-full text-left bg-card border border-line rounded-2xl overflow-hidden active:scale-[0.982] transition-transform mb-5"
    >
      {/* Condition banner */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: gc.bg, borderBottom: `1px solid ${gc.bg}` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: gc.dot }}
          />
          <span className="text-[12px] font-bold" style={{ color: gc.color }}>
            {gc.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-ink-3">
          <span className="text-[11px] font-medium">Meteo getto</span>
          <ChevronRight size={12} />
        </div>
      </div>

      {/* Conditions row */}
      <div className="flex items-center gap-4 px-4 py-3">
        <span className="text-[32px] leading-none">{data.emoji}</span>
        <div>
          <span className="font-display font-extrabold text-[26px] tnum" style={{ color: gc.color }}>
            {data.temperatura}°C
          </span>
        </div>
        <div className="flex items-center gap-1 text-[12px] text-ink-3 ml-auto">
          <Wind size={12} />
          <span className="tnum">{data.vento} km/h</span>
        </div>
      </div>
    </button>
  );
}
