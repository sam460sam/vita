import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Card } from '@/ui';
import { db } from '@/data/db';
import type { GiornaleEntry } from '@/data/types';
import { GiornaleSheet } from './GiornaleSheet';

interface Props {
  cantiereId: string;
}

const MESI_IT = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const GIORNI_IT = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday=0
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const METEO_EMOJI: Record<string, string> = {
  sereno: '☀️',
  poco_nuvoloso: '🌤',
  nuvoloso: '⛅',
  coperto: '☁️',
  pioggia: '🌧',
  neve: '🌨',
  temporale: '⛈',
  vento: '💨',
};

export function GiornaledCantiere({ cantiereId }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const entries = useLiveQuery<GiornaleEntry[], GiornaleEntry[]>(
    () => db.giornaleEntries.where('cantiereId').equals(cantiereId).toArray(),
    [cantiereId],
    [],
  );

  const entryMap = new Map<string, GiornaleEntry>(
    (entries ?? []).map((e) => [e.data, e]),
  );

  const days = getMonthDays(year, month);
  const todayIso = toIso(today);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  function openDay(d: Date) {
    const iso = toIso(d);
    setSelectedDate(iso);
    setSheetOpen(true);
  }

  const selectedEntry = selectedDate ? entryMap.get(selectedDate) : undefined;

  return (
    <>
      <Card className="mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-ink-3" />
            <span className="font-semibold text-[15px]">Giornale di cantiere</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="h-7 w-7 flex items-center justify-center rounded-full text-ink-2 hover:bg-section"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13px] font-medium text-ink min-w-[110px] text-center">
              {MESI_IT[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="h-7 w-7 flex items-center justify-center rounded-full text-ink-2 hover:bg-section"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {GIORNI_IT.map((g) => (
            <div key={g} className="text-center text-[10px] font-semibold text-ink-3 uppercase tracking-wide py-1">
              {g}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />;
            const iso = toIso(d);
            const hasEntry = entryMap.has(iso);
            const isToday = iso === todayIso;
            const isSelected = iso === selectedDate;

            return (
              <button
                key={iso}
                onClick={() => openDay(d)}
                className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-primary text-on-primary'
                    : isToday
                    ? 'ring-1 ring-primary text-primary'
                    : 'hover:bg-section text-ink'
                }`}
              >
                <span className="text-[13px] font-medium leading-none">{d.getDate()}</span>
                {hasEntry ? (
                  <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-on-primary' : 'bg-primary'}`} />
                ) : (
                  <span className="mt-0.5 w-1.5 h-1.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day summary */}
        {selectedEntry && (
          <div className="mt-3 pt-3 border-t border-line/50 flex items-center gap-2 text-[13px] text-ink-2 flex-wrap">
            {selectedEntry.meteo && (
              <span className="text-[18px] leading-none">{METEO_EMOJI[selectedEntry.meteo] ?? ''}</span>
            )}
            {selectedEntry.temperatura != null && (
              <span className="font-bold text-ink">{selectedEntry.temperatura}°C</span>
            )}
            {selectedEntry.vento != null && selectedEntry.vento > 15 && (
              <span className="text-ink-3">💨 {selectedEntry.vento} km/h</span>
            )}
            {selectedEntry.manodopera.length > 0 && (
              <span className="font-medium text-ink">· {selectedEntry.manodopera.length} operai</span>
            )}
            {selectedEntry.note && (
              <span className="flex-1 truncate italic">{selectedEntry.note}</span>
            )}
          </div>
        )}
      </Card>

      {selectedDate && (
        <GiornaleSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          cantiereId={cantiereId}
          data={selectedDate}
        />
      )}
    </>
  );
}
