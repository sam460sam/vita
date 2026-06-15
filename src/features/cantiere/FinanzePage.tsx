import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { useCantieri } from '@/hooks/useCantieri';
import type { Cantiere } from '@/data/types';
import { formatEuro } from './logic';

// ── Helpers ───────────────────────────────────────────────────

function incassatoDa(c: Cantiere): number {
  if (c.pagamento === 'saldato') return c.importo;
  return c.acconto ?? 0;
}

function daIncassareDa(c: Cantiere): number {
  if (c.pagamento === 'saldato') return 0;
  return c.importo - (c.acconto ?? 0);
}

function isScaduto(c: Cantiere): boolean {
  if (c.pagamento === 'saldato') return false;
  if (!c.scadenzaPagamento) return false;
  return new Date(c.scadenzaPagamento) < new Date();
}

// ── KPI card ──────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="bg-card border border-line rounded-2xl p-4 flex flex-col gap-1"
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={15} style={{ color }} />
        <span className="text-[11px] font-black text-ink-3 uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-display font-extrabold text-[22px] tnum" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] text-ink-3">{sub}</div>
    </div>
  );
}

// ── Monthly bar chart ─────────────────────────────────────────

interface MonthBar {
  label: string;         // "Gen", "Feb", …
  importo: number;
  incassato: number;
}

function BarChart({ bars }: { bars: MonthBar[] }) {
  const max = Math.max(...bars.map((b) => b.importo), 1);

  return (
    <div className="bg-card border border-line rounded-2xl p-4 mb-4">
      <p className="text-[11px] font-black text-ink-3 uppercase tracking-wider mb-4">
        Ultimi 6 mesi — fatturato
      </p>
      <div className="flex items-end gap-2 h-28">
        {bars.map((b) => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative flex flex-col justify-end" style={{ height: 88 }}>
              {/* Incassato (solid) */}
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(b.incassato / max) * 88}px`,
                  background: 'var(--c-success)',
                  opacity: 0.9,
                }}
              />
              {/* Da incassare (overlay) */}
              {b.importo > b.incassato && (
                <div
                  className="w-full absolute bottom-0 rounded-t-lg"
                  style={{
                    height: `${(b.importo / max) * 88}px`,
                    background: 'var(--c-primary)',
                    opacity: 0.15,
                  }}
                />
              )}
            </div>
            <span className="text-[9px] text-ink-3 font-bold uppercase">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--c-success)' }} />
          <span className="text-[10.5px] text-ink-3">Incassato</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--c-primary)', opacity: 0.35 }} />
          <span className="text-[10.5px] text-ink-3">Da incassare</span>
        </div>
      </div>
    </div>
  );
}

// ── Cantiere row ──────────────────────────────────────────────

function CantRow({ c, onClick }: { c: Cantiere; onClick: () => void }) {
  const da = daIncassareDa(c);
  const scad = isScaduto(c);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 border-b border-line/50 last:border-0 text-left active:bg-section transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink truncate">{c.cliente}</div>
        {c.scadenzaPagamento && c.pagamento !== 'saldato' && (
          <div
            className="text-[11.5px] mt-0.5 font-medium"
            style={{ color: scad ? 'var(--c-danger)' : 'var(--c-warning)' }}
          >
            {scad ? 'Scaduto' : 'Scade'} {new Date(c.scadenzaPagamento).toLocaleDateString('it-IT')}
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-display font-bold text-[14px] tnum" style={{
          color: c.pagamento === 'saldato' ? 'var(--c-success)' : scad ? 'var(--c-danger)' : 'var(--c-primary)',
        }}>
          {c.pagamento === 'saldato' ? formatEuro(c.importo) : formatEuro(da)}
        </div>
        <div className="text-[10.5px] text-ink-3">
          {c.pagamento === 'saldato' ? 'saldato' : 'da incassare'}
        </div>
      </div>
      <ChevronRight size={14} className="text-ink-3 flex-shrink-0 ml-1" />
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────

export function FinanzePage() {
  const navigate = useNavigate();
  const cantieri = useCantieri();

  const {
    incassato,
    daIncassare,
    scaduto,
    pipeline90,
    bars,
    saldatiCount,
    apertiCount,
    scadutiCount,
    scadutiList,
    apertiList,
  } = useMemo(() => {
    const incassato = cantieri.reduce((s, c) => s + incassatoDa(c), 0);
    const daIncassare = cantieri.reduce((s, c) => s + daIncassareDa(c), 0);
    const scadutiList = cantieri.filter(isScaduto);
    const scaduto = scadutiList.reduce((s, c) => s + daIncassareDa(c), 0);

    // 90-day pipeline: cantieri with dataPrevista in the next 90 days, not yet saldati
    const in90 = new Date();
    in90.setDate(in90.getDate() + 90);
    const pipeline90 = cantieri
      .filter((c) => c.pagamento !== 'saldato' && c.dataPrevista && new Date(c.dataPrevista) <= in90)
      .reduce((s, c) => s + daIncassareDa(c), 0);

    // Last 6 months bars
    const now = new Date();
    const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const bars: MonthBar[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const prefix = `${yyyy}-${mm}`;
      const monthCantieri = cantieri.filter((c) => {
        const ref = c.dataCompletamento ?? c.dataPrevista;
        return ref?.startsWith(prefix);
      });
      bars.push({
        label: MESI[d.getMonth()],
        importo: monthCantieri.reduce((s, c) => s + c.importo, 0),
        incassato: monthCantieri.reduce((s, c) => s + incassatoDa(c), 0),
      });
    }

    const apertiList = cantieri
      .filter((c) => c.pagamento !== 'saldato')
      .sort((a, b) => daIncassareDa(b) - daIncassareDa(a));

    return {
      incassato,
      daIncassare,
      scaduto,
      pipeline90,
      bars,
      saldatiCount: cantieri.filter((c) => c.pagamento === 'saldato').length,
      apertiCount: cantieri.filter((c) => c.pagamento !== 'saldato').length,
      scadutiCount: scadutiList.length,
      scadutiList,
      apertiList,
    };
  }, [cantieri]);

  if (cantieri.length === 0) {
    return (
      <>
        <PageHeader title="Cruscotto finanziario" back="/altro" />
        <Screen>
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <TrendingUp size={40} className="text-ink-3 mb-4" />
            <h3 className="font-display font-bold text-[17px] text-ink">Nessun dato</h3>
            <p className="text-[13px] text-ink-3 mt-1.5 max-w-xs leading-relaxed">
              Aggiungi i tuoi cantieri per vedere il cruscotto finanziario.
            </p>
          </div>
        </Screen>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Cruscotto finanziario" back="/altro" />

      <Screen>
        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-2.5 mb-5">
          <KpiCard
            icon={CheckCircle2}
            label="Incassato"
            value={formatEuro(incassato)}
            sub={`${saldatiCount} cantieri saldati`}
            color="var(--c-success)"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <KpiCard
              icon={Clock}
              label="Da incassare"
              value={formatEuro(daIncassare)}
              sub={`${apertiCount} aperti`}
              color="var(--c-primary)"
            />
            <KpiCard
              icon={AlertCircle}
              label="Scaduto"
              value={scaduto > 0 ? formatEuro(scaduto) : '—'}
              sub={scadutiCount > 0 ? `${scadutiCount} scaduti` : 'tutto ok'}
              color={scaduto > 0 ? 'var(--c-danger)' : 'var(--c-ink-3)'}
            />
          </div>
        </div>

        {/* 90-day pipeline */}
        {pipeline90 > 0 && (
          <div
            className="rounded-2xl p-4 mb-5 border"
            style={{ background: 'rgba(245,81,0,0.06)', borderColor: 'rgba(245,81,0,0.20)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} style={{ color: 'var(--c-primary)' }} />
              <span className="text-[11px] font-black text-ink-3 uppercase tracking-wider">
                Pipeline 90 giorni
              </span>
            </div>
            <div className="font-display font-extrabold text-[24px] tnum" style={{ color: 'var(--c-primary)' }}>
              {formatEuro(pipeline90)}
            </div>
            <p className="text-[12px] text-ink-3 mt-0.5">
              Ricavi attesi da cantieri in programma entro 90 giorni
            </p>
          </div>
        )}

        {/* Bar chart */}
        <BarChart bars={bars} />

        {/* Scaduti urgenti */}
        {scadutiList.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-black text-ink-3 uppercase tracking-[0.08em] mb-2 px-1">
              ⚠️ Pagamenti scaduti
            </p>
            <div className="bg-card border border-line rounded-2xl px-4">
              {scadutiList.map((c) => (
                <CantRow key={c.id} c={c} onClick={() => navigate(`/cantiere/${c.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Tutti i saldi aperti */}
        {apertiList.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-black text-ink-3 uppercase tracking-[0.08em] mb-2 px-1">
              Saldi aperti
            </p>
            <div className="bg-card border border-line rounded-2xl px-4">
              {apertiList.slice(0, 8).map((c) => (
                <CantRow key={c.id} c={c} onClick={() => navigate(`/cantiere/${c.id}`)} />
              ))}
              {apertiList.length > 8 && (
                <div className="py-3 text-center text-[12px] text-ink-3">
                  +{apertiList.length - 8} altri cantieri
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between py-4 border-t border-line/60 mb-2">
          <div className="text-[13px] text-ink-3">
            Totale fatturato
          </div>
          <div className="font-display font-bold text-[16px] tnum text-ink">
            {formatEuro(cantieri.reduce((s, c) => s + c.importo, 0))}
          </div>
        </div>
      </Screen>
    </>
  );
}
