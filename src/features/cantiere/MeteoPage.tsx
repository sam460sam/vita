import { useState, useEffect } from 'react';
import { RefreshCw, Wind, Droplets, Thermometer, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import {
  fetchMeteoCompleto,
  getMeteoLocation,
  type MeteoData,
  type MeteoGiornata,
  type GettoCond,
} from './meteo-api';

// ── Config ────────────────────────────────────────────────────

const GETTO_CONFIG: Record<GettoCond, {
  label: string; sub: string; color: string; bg: string;
  icon: typeof CheckCircle2;
}> = {
  ottimale: {
    label: 'Ottimale per gettare',
    sub: 'Temperatura, vento e pioggia nella norma.',
    color: 'var(--c-success)',
    bg: 'rgba(22,163,74,0.08)',
    icon: CheckCircle2,
  },
  attenzione: {
    label: 'Attenzione',
    sub: 'Verifica temperatura o vento prima di iniziare.',
    color: 'var(--c-warning)',
    bg: 'rgba(217,119,6,0.08)',
    icon: AlertTriangle,
  },
  non_colare: {
    label: 'Non colare oggi',
    sub: 'Temperatura, pioggia o vento fuori range sicuro.',
    color: 'var(--c-danger)',
    bg: 'rgba(220,38,38,0.08)',
    icon: XCircle,
  },
};

const GIORNO_LABELS = ['Oggi', 'Domani', 'Dopodomani', 'Tra 3 giorni'];

const TIPS: Record<GettoCond, string[]> = {
  ottimale: [
    'Condizioni ideali — procedi con il getto.',
    'Bagna il fondo 30 min prima per ridurre l\'assorbimento.',
    'Copri con film plastico dopo il getto per la maturazione.',
  ],
  attenzione: [
    'Freddo < 10 °C: usa accelerante o riscalda il sottofondo.',
    'Caldo > 30 °C: bagna il fondo, getta nelle ore fresche (mattina presto).',
    'Vento > 30 km/h: scherma il getto e copri subito per evitare fessurazioni.',
    'Pioggia leggera: aspetta che si esaurisca o proteggi l\'area.',
  ],
  non_colare: [
    'Gelo: il calcestruzzo non fa presa sotto +5 °C — rimanda.',
    'Calore > 35 °C: rischio di fessurazioni gravi — posticipa.',
    'Pioggia: l\'acqua altera il rapporto a/c e danneggia la superfice.',
    'Pianifica per una giornata con previsioni nella norma.',
  ],
};

// ── Sub-components ────────────────────────────────────────────

function HeroCard({ data }: { data: MeteoData }) {
  const gc = GETTO_CONFIG[data.getto];
  const Icon = gc.icon;

  return (
    <div
      className="rounded-2xl border p-5 mb-5 flex flex-col gap-3"
      style={{ background: gc.bg, borderColor: gc.color + '30' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[48px] leading-none mb-2">{data.emoji}</div>
          <div className="font-display font-extrabold text-[36px] tnum" style={{ color: gc.color }}>
            {data.temperatura}°C
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
            <Wind size={14} />
            <span className="tnum">{data.vento} km/h</span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2.5 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.4)' }}
      >
        <Icon size={18} style={{ color: gc.color, flexShrink: 0 }} />
        <div>
          <div className="font-bold text-[14px]" style={{ color: gc.color }}>
            {gc.label}
          </div>
          <div className="text-[12px] text-ink-3 mt-0.5">{gc.sub}</div>
        </div>
      </div>
    </div>
  );
}

function GiornoCard({ g, index }: { g: MeteoGiornata; index: number }) {
  const gc = GETTO_CONFIG[g.getto];
  const Icon = gc.icon;

  return (
    <div className="bg-card border border-line rounded-2xl p-3.5 flex items-center gap-3">
      <span className="text-[28px] leading-none">{g.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-ink">
          {GIORNO_LABELS[index] ?? new Date(g.data).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[12px] text-ink-3">
          <Thermometer size={11} />
          <span className="tnum">{g.tempMin}° – {g.tempMax}°</span>
          {g.pioggiaMm > 0 && (
            <>
              <Droplets size={11} />
              <span className="tnum">{g.pioggiaMm} mm</span>
            </>
          )}
          <Wind size={11} />
          <span className="tnum">{g.ventoMaxKmh} km/h</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Icon size={16} style={{ color: gc.color }} />
        <span className="text-[11px] font-bold" style={{ color: gc.color }}>
          {g.getto === 'ottimale' ? 'OK' : g.getto === 'attenzione' ? '⚠️' : '✗'}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────

export function MeteoPage() {
  const [current, setCurrent] = useState<MeteoData | null>(null);
  const [giorni, setGiorni] = useState<MeteoGiornata[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  async function load(skipCache = false) {
    if (skipCache) {
      try { sessionStorage.removeItem('getto.meteo.coords'); } catch { /* ignore */ }
    }
    const coords = await getMeteoLocation();
    const result = await fetchMeteoCompleto(coords.lat, coords.lon);
    if (result) {
      setCurrent(result.current);
      setGiorni(result.giorni);
      setError(false);
    } else {
      setError(true);
    }
  }

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  async function refresh() {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }

  return (
    <>
      <PageHeader
        title="Meteo getto"
        back="/altro"
        action={
          <button
            onClick={refresh}
            disabled={refreshing}
            className="h-9 w-9 flex items-center justify-center rounded-full text-ink-2 hover:bg-section disabled:opacity-40"
            aria-label="Aggiorna"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        }
      />

      <Screen>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }}
            />
            <p className="text-[13px] text-ink-3">Rilevamento posizione…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <span className="text-[48px] mb-3">🌐</span>
            <h3 className="font-display font-bold text-[17px] text-ink">Dati non disponibili</h3>
            <p className="text-[13px] text-ink-3 mt-1.5 max-w-xs leading-relaxed">
              Controlla la connessione e riprova.
            </p>
            <button
              onClick={refresh}
              className="mt-5 h-11 px-5 rounded-2xl btn-primary text-[14px] font-bold"
            >
              Riprova
            </button>
          </div>
        )}

        {!loading && !error && current && (
          <>
            <HeroCard data={current} />

            {giorni.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-black text-ink-3 uppercase tracking-[0.08em] mb-2.5 px-1">
                  Prossimi giorni
                </p>
                <div className="space-y-2.5">
                  {giorni.map((g, i) => (
                    <GiornoCard key={g.data} g={g} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mb-4">
              <p className="text-[11px] font-black text-ink-3 uppercase tracking-[0.08em] mb-2.5 px-1">
                Consigli per il getto
              </p>
              <div className="bg-card border border-line rounded-2xl p-4 space-y-2.5">
                {TIPS[current.getto].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span
                      className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: GETTO_CONFIG[current.getto].color }}
                    />
                    <p className="text-[13px] text-ink-2 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-section rounded-2xl p-4 mb-4 space-y-2">
              <p className="text-[11px] font-black text-ink-3 uppercase tracking-wider mb-1">
                Soglie di sicurezza calcestruzzo
              </p>
              {[
                { label: 'Ottimale', range: '10–30 °C · Pioggia 0 mm · Vento < 30 km/h', color: 'var(--c-success)' },
                { label: 'Attenzione', range: '5–10 °C o 30–35 °C · Vento 30–40 km/h', color: 'var(--c-warning)' },
                { label: 'Non colare', range: '< 5 °C o > 35 °C · Pioggia > 0.5 mm · Vento > 40 km/h', color: 'var(--c-danger)' },
              ].map(({ label, range, color }) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <div>
                    <span className="text-[12px] font-bold text-ink">{label}: </span>
                    <span className="text-[12px] text-ink-3">{range}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10.5px] text-ink-3 text-center pb-2">
              Dati: Open-Meteo.com (aggiornamento ogni 30 min) · Posizione via GPS
            </p>
          </>
        )}
      </Screen>
    </>
  );
}
