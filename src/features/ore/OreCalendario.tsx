import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getWorkDaysMonth } from '@/data/ore-repo';
import type { WorkDay, WorkProfile } from '@/data/types';
import {
  buildCalendarGrid,
  nomeMese,
  riepilogoMese,
  TIPI_GIORNATA,
  formatEuroOre,
  tipoInfo,
} from './ore-logic';
import { GiornataSheet } from './GiornataSheet';
import { cn } from '@/lib/cn';

const GIORNI_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

interface Props {
  profile: WorkProfile;
}

export function OreCalendario({ profile }: Props) {
  const today = new Date();
  const [anno, setAnno] = useState(today.getFullYear());
  const [mese, setMese] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWorkDay, setSelectedWorkDay] = useState<WorkDay | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Swipe detection
  const touchStartX = useRef<number | null>(null);

  const workDays =
    useLiveQuery(() => getWorkDaysMonth(anno, mese), [anno, mese]) ?? [];

  const cells = buildCalendarGrid(anno, mese, workDays);
  const riepilogo = riepilogoMese(workDays, profile);

  function prevMese() {
    if (mese === 1) { setAnno((a) => a - 1); setMese(12); }
    else setMese((m) => m - 1);
  }

  function nextMese() {
    if (mese === 12) { setAnno((a) => a + 1); setMese(1); }
    else setMese((m) => m + 1);
  }

  function goToToday() {
    setAnno(today.getFullYear());
    setMese(today.getMonth() + 1);
  }

  function openDay(date: string, workDay: WorkDay | null) {
    setSelectedDate(date);
    setSelectedWorkDay(workDay);
    setSheetOpen(true);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? nextMese() : prevMese();
    touchStartX.current = null;
  }

  return (
    <>
      <div
        className="select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Month navigator */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMese}
            className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section active:scale-90 transition-transform"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={goToToday}
            className="font-display text-[17px] font-bold text-ink"
          >
            {nomeMese(anno, mese)}
          </button>
          <button
            onClick={nextMese}
            className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section active:scale-90 transition-transform"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {GIORNI_IT.map((g) => (
            <div key={g} className="text-center text-[11px] font-semibold text-ink-3 py-1">
              {g}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} />;
            const { day, date, workDay, isToday, isWeekend } = cell;
            const tipo = workDay?.tipo;
            const color = tipo ? tipoInfo(tipo).color : undefined;

            return (
              <button
                key={date}
                onClick={() => openDay(date, workDay)}
                className={cn(
                  'aspect-square rounded-xl flex flex-col items-center justify-center gap-0 transition-transform active:scale-90 text-[13px] font-semibold relative',
                  color
                    ? 'text-white'
                    : isToday
                    ? 'text-primary ring-2 ring-primary'
                    : isWeekend
                    ? 'text-ink-3'
                    : 'text-ink hover:bg-section',
                )}
                style={color ? { backgroundColor: color } : undefined}
              >
                <span className="leading-none">{day}</span>
                {workDay && (
                  <span className="text-[9px] font-bold opacity-90 leading-none mt-0.5">
                    {workDay.oreCalcolate.toFixed(1)}h
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 mb-4">
          {TIPI_GIORNATA.map((t) => {
            const count = riepilogo.giorniPerTipo[t.value] ?? 0;
            if (count === 0) return null;
            return (
              <div key={t.value} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-[11px] text-ink-2 font-medium">
                  {t.label} {count}g
                </span>
              </div>
            );
          })}
        </div>

        {/* Monthly summary card */}
        <div className="bg-card rounded-card shadow-card border border-line/60 p-4 mt-2">
          <div className="text-[12px] font-semibold text-ink-2 uppercase tracking-wide mb-3">
            Riepilogo mese
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="font-display text-2xl font-extrabold text-ink tnum leading-tight">
                {riepilogo.totalOre.toFixed(1)}
              </div>
              <div className="text-[11px] text-ink-3 mt-0.5">ore tot.</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-extrabold text-ink tnum leading-tight">
                {riepilogo.giorniTotali}
              </div>
              <div className="text-[11px] text-ink-3 mt-0.5">giorni</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-extrabold text-ink tnum leading-tight">
                {riepilogo.giorniTotali > 0
                  ? (riepilogo.totalOre / riepilogo.giorniTotali).toFixed(1)
                  : '—'}
              </div>
              <div className="text-[11px] text-ink-3 mt-0.5">h/giorno</div>
            </div>
          </div>

          {profile.tariffaOraria > 0 && riepilogo.totalOre > 0 && (
            <div className="pt-3 border-t border-line/50 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-ink-3">Lordo stimato</div>
                <div className="font-display font-bold text-[17px] tnum text-ink">
                  {formatEuroOre(riepilogo.lordo)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-3">Netto stimato</div>
                <div className="font-display font-bold text-[17px] tnum text-success">
                  {formatEuroOre(riepilogo.netto)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add day FAB */}
        <button
          onClick={() => {
            const todayStr = new Date().toISOString().slice(0, 10);
            openDay(todayStr, workDays.find((w) => w.data === todayStr) ?? null);
          }}
          className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Aggiungi ore"
        >
          <Plus size={24} />
        </button>
      </div>

      {selectedDate && (
        <GiornataSheet
          open={sheetOpen}
          date={selectedDate}
          existing={selectedWorkDay}
          profile={profile}
          onClose={() => setSheetOpen(false)}
          onSaved={() => { /* useLiveQuery auto-refreshes */ }}
        />
      )}
    </>
  );
}
