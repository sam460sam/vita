import { useState } from 'react';
import { Phone, MapPin, ExternalLink, Map, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { Card } from '@/ui';
import {
  IMPIANTI_VENETO,
  PROVINCE_VENETO,
  PROVINCE_LABELS,
  mapsUrl,
  mapsProvinciaUrl,
  type ImpiantoCalcestruzzo,
} from './impianti';
import { getMioProfilo } from './profiloRepo';

function ClassiBadge({ classi }: { classi: string[] }) {
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {classi.map((c) => (
        <span
          key={c}
          className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-medium"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function ImpiantoCard({ imp }: { imp: ImpiantoCalcestruzzo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] text-ink leading-snug">{imp.nome}</div>
          {imp.gruppo && (
            <div className="text-[11px] text-ink-3 mt-0.5">{imp.gruppo}</div>
          )}
          <div className="flex items-start gap-1 mt-1.5">
            <MapPin size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-[12px] text-ink-2 leading-snug">{imp.indirizzo}</span>
          </div>
          {imp.classiDisponibili && <ClassiBadge classi={imp.classiDisponibili} />}
        </div>

        {/* Right column: phone + maps */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-1">
          {imp.telefono && (
            <a
              href={`tel:${imp.telefono.replace(/\s/g, '')}`}
              className="flex items-center gap-1 text-[13px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-xl"
            >
              <Phone size={13} />
              {imp.telefono}
            </a>
          )}
          <a
            href={mapsUrl(imp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[12px] text-blue-600 dark:text-blue-400 font-medium"
          >
            <ExternalLink size={12} />
            Apri in Maps
          </a>
        </div>
      </div>

      {/* Expandable: agente + note */}
      {(imp.telefonoAgente || imp.nomeAgente || imp.noteProduzione || imp.sito) && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-ink-3 mt-2 hover:text-ink-2 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Meno dettagli' : 'Più dettagli'}
          </button>

          {expanded && (
            <div className="mt-2 pt-2 border-t border-line/50 space-y-1.5">
              {imp.nomeAgente && (
                <div className="text-[12px] text-ink-2">
                  <span className="font-semibold">Agente: </span>{imp.nomeAgente}
                </div>
              )}
              {imp.telefonoAgente && (
                <a
                  href={`tel:${imp.telefonoAgente.replace(/\s/g, '')}`}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-green-600"
                >
                  <Phone size={13} />
                  Agente: {imp.telefonoAgente}
                </a>
              )}
              {imp.noteProduzione && (
                <p className="text-[12px] text-ink-3 italic">{imp.noteProduzione}</p>
              )}
              {imp.sito && (
                <a
                  href={imp.sito}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] text-blue-600 dark:text-blue-400"
                >
                  <ExternalLink size={11} />
                  {imp.sito.replace('https://', '')}
                </a>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export function ImpiantiPage() {
  const profilo = getMioProfilo();
  const defaultProv = profilo?.provincia && PROVINCE_VENETO.includes(profilo.provincia)
    ? profilo.provincia
    : '';
  const [filterProv, setFilterProv] = useState<string>(defaultProv);

  const filtered = filterProv
    ? IMPIANTI_VENETO.filter((i) => i.provincia === filterProv)
    : IMPIANTI_VENETO;

  return (
    <>
      <PageHeader title="Impianti calcestruzzo" back="/cantiere" />
      <Screen>

        {/* Province filter + open maps */}
        <div className="flex gap-2 mb-4">
          <select
            value={filterProv}
            onChange={(e) => setFilterProv(e.target.value)}
            className="flex-1 h-10 px-3 rounded-xl bg-section border border-line text-[14px] text-ink focus:border-ink/30 outline-none transition-colors appearance-none"
          >
            <option value="">Tutte le province</option>
            {PROVINCE_VENETO.map((p) => (
              <option key={p} value={p}>
                {p} — {PROVINCE_LABELS[p]}
              </option>
            ))}
          </select>
          <a
            href={filterProv ? mapsProvinciaUrl(filterProv) : mapsProvinciaUrl('Veneto')}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-3 flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[13px] font-medium flex-shrink-0"
          >
            <Map size={15} />
            Mappa
          </a>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Dati indicativi — verifica sempre indirizzi e orari prima di ordinare.
            Usa "Apri in Maps" per confermare la posizione e trovare contatti aggiornati.
          </p>
        </div>

        {/* Count */}
        <div className="text-[12px] text-ink-3 mb-3">
          {filtered.length} impianti trovati
          {filterProv ? ` in provincia di ${PROVINCE_LABELS[filterProv]}` : ' in Veneto'}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((imp) => (
            <ImpiantoCard key={imp.id} imp={imp} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 mb-2 text-center">
          <a
            href="https://www.google.com/maps/search/?api=1&query=impianto+calcestruzzo+betonaggio+Veneto"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] text-blue-600 dark:text-blue-400 font-medium"
          >
            <Map size={15} />
            Cerca altri impianti su Google Maps
          </a>
        </div>
      </Screen>
    </>
  );
}
