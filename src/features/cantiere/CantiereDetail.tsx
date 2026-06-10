import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams } from 'react-router-dom';
import { Phone, MapPin, Calendar, Edit3, Camera, PenTool, FileText, Share2, StickyNote, Plus } from 'lucide-react';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { Card, CardHeader, Button } from '@/ui';
import type { Note } from '@/data/types';
import { formatEuro, statoInfo, pagamentoInfo } from './logic';
import { CantiereForm } from './CantiereForm';
import { CementoCalc } from './CementoCalc';
import { VerbaleSheet } from './VerbaleSheet';
import { condividiVerbale } from './generateVerbale';
import { ContrattoSheet } from './ContrattoSheet';
import { condividiContratto } from './generateContratto';
import { GiornaledCantiere } from './GiornaledCantiere';
import { PhotoAnnotator } from './PhotoAnnotator';
import { saveCantiere } from '@/data/cantiere-repo';
import { getNotesByCantiere, getOrCreateProjectForCantiere } from '@/data/note-repo';
import { NoteSheet } from '@/features/note/NoteSheet';
import { NoteCard } from '@/features/note/NoteCard';
import { useCantiere, useOperai } from '@/hooks/useCantieri';
import { useTeam } from '@/auth/TeamContext';

export function CantiereDetail() {
  const { id } = useParams<{ id: string }>();
  const { team } = useTeam();
  const [editOpen, setEditOpen] = useState(false);
  const [verbaleOpen, setVerbaleOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [contrattoOpen, setContrattoOpen] = useState(false);
  const [contrattoPdfLoading, setContrattoPdfLoading] = useState(false);
  const [annotatePhoto, setAnnotatePhoto] = useState<{ index: number; src: string } | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [noteProjectId, setNoteProjectId] = useState<string | undefined>(undefined);
  const [noteRefresh, setNoteRefresh] = useState(0);

  const cantiere = useCantiere(id);
  const cantiereNotes = useLiveQuery(
    () => (id ? getNotesByCantiere(id) : Promise.resolve([])),
    [id, noteRefresh],
  ) ?? [];
  const operai = useOperai(cantiere?.operaiIds);

  if (cantiere === undefined) return null;
  if (cantiere === null) return null;

  async function apriNuovaNota() {
    if (!cantiere) return;
    const project = await getOrCreateProjectForCantiere(cantiere.id, cantiere.cliente);
    setNoteProjectId(project.id);
    setEditNote(null);
    setNoteSheetOpen(true);
  }

  async function scaricaPdf() {
    if (!cantiere) return;
    setPdfLoading(true);
    try { await condividiVerbale(cantiere); }
    finally { setPdfLoading(false); }
  }

  async function scaricaContrattoPdf() {
    if (!cantiere) return;
    setContrattoPdfLoading(true);
    try { await condividiContratto(cantiere, team?.name ?? 'Impresa Edile'); }
    finally { setContrattoPdfLoading(false); }
  }

  const sInfo = statoInfo(cantiere.stato);
  const pInfo = pagamentoInfo(cantiere.pagamento);
  const restante = cantiere.importo - (cantiere.acconto ?? 0);

  return (
    <>
      <PageHeader
        title={cantiere.cliente}
        back
       
        action={
          <button
            onClick={() => setEditOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section"
            aria-label="Modifica"
          >
            <Edit3 size={20} />
          </button>
        }
      />
      <Screen>
        {/* Status badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className={`text-[13px] font-semibold px-3 py-1 rounded-full ${sInfo.color}`}>
            {sInfo.label}
          </span>
          <span className={`text-[13px] font-semibold px-3 py-1 rounded-full ${pInfo.color}`}>
            {pInfo.label}
          </span>
        </div>

        {/* Info card */}
        <Card className="mb-4">
          <CardHeader title="Cantiere" />
          <div className="space-y-2 text-[14px]">
            {cantiere.telefono && (
              <a href={`tel:${cantiere.telefono}`} className="flex items-center gap-2 text-ink-2">
                <Phone size={15} className="text-ink-3 flex-shrink-0" />
                {cantiere.telefono}
              </a>
            )}
            {cantiere.indirizzo && (
              <div className="flex items-center gap-2 text-ink-2">
                <MapPin size={15} className="text-ink-3 flex-shrink-0" />
                {cantiere.indirizzo}
              </div>
            )}
            {cantiere.dataPrevista && (
              <div className="flex items-center gap-2 text-ink-2">
                <Calendar size={15} className="text-ink-3 flex-shrink-0" />
                {cantiere.dataPrevista}
              </div>
            )}

            <div className="pt-2 border-t border-line/50 grid grid-cols-3 gap-3 mt-2">
              <div>
                <div className="text-[11px] text-ink-3 uppercase tracking-wide">m²</div>
                <div className="font-display font-bold text-[16px] tnum">{cantiere.mq}</div>
              </div>
              <div>
                <div className="text-[11px] text-ink-3 uppercase tracking-wide">Spessore</div>
                <div className="font-display font-bold text-[16px] tnum">{cantiere.spessore} cm</div>
              </div>
              <div>
                <div className="text-[11px] text-ink-3 uppercase tracking-wide">Importo</div>
                <div className="font-display font-bold text-[16px] tnum">{formatEuro(cantiere.importo)}</div>
              </div>
            </div>

            {cantiere.acconto != null && cantiere.acconto > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-ink-3 uppercase tracking-wide">Acconto</div>
                  <div className="font-display font-semibold text-success tnum">{formatEuro(cantiere.acconto)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-ink-3 uppercase tracking-wide">Restante</div>
                  <div className="font-display font-semibold text-danger tnum">{formatEuro(restante)}</div>
                </div>
              </div>
            )}

            {cantiere.scadenzaPagamento && cantiere.pagamento !== 'saldato' && (
              <div className="flex items-center gap-2 text-[12.5px] text-ink-2 pt-1">
                <Calendar size={14} className="text-ink-3 flex-shrink-0" />
                Saldo da riscuotere entro il {new Date(cantiere.scadenzaPagamento).toLocaleDateString('it-IT')}
              </div>
            )}

            {cantiere.note && (
              <p className="text-ink-2 text-[13px] pt-1 italic border-t border-line/50">{cantiere.note}</p>
            )}
          </div>
        </Card>

        {/* Cement calculator */}
        <CementoCalc cantiere={cantiere} />

        {/* Contratto pre-lavori */}
        <Card className="mb-4">
          <CardHeader title="Contratto pre-lavori" />
          {cantiere.contrattoFirmaCliente ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 font-medium text-[14px]">
                <PenTool size={16} />
                Contratto firmato
                {cantiere.contrattoClienteNome && (
                  <span className="text-ink-3 font-normal text-[12px]">
                    — {cantiere.contrattoClienteNome}
                  </span>
                )}
              </div>
              <img
                src={cantiere.contrattoFirmaCliente}
                alt="Firma contratto"
                className="h-16 object-contain border border-line rounded-lg bg-white"
              />
              <div className="flex gap-2">
                <Button
                  onClick={scaricaContrattoPdf}
                  disabled={contrattoPdfLoading}
                  variant="primary"
                  className="flex-1"
                >
                  {contrattoPdfLoading ? (
                    'Generazione...'
                  ) : (
                    <>
                      <Share2 size={15} className="mr-1.5" />
                      {typeof navigator !== 'undefined' && 'canShare' in navigator ? 'Condividi PDF' : 'Scarica PDF'}
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setContrattoOpen(true)}>
                  <FileText size={15} className="mr-1.5" />
                  Modifica
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-ink-2">
                Nessun contratto firmato. Fai firmare il cliente prima di iniziare i lavori
                per tutelare il pagamento.
              </p>
              <Button onClick={() => setContrattoOpen(true)}>
                <PenTool size={16} className="mr-2" />
                Firma contratto
              </Button>
            </div>
          )}
        </Card>

        {/* Verbale */}
        <Card className="mb-4">
          <CardHeader title="Verbale di consegna" />
          {cantiere.firmaCliente ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 font-medium text-[14px]">
                <PenTool size={16} />
                Cliente ha firmato
              </div>
              <img
                src={cantiere.firmaCliente}
                alt="Firma cliente"
                className="h-16 object-contain border border-line rounded-lg bg-white"
              />
              {cantiere.foto.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {cantiere.foto.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={f} alt="Foto cantiere" className="rounded-lg aspect-square object-cover w-full" />
                      <button
                        onClick={() => setAnnotatePhoto({ index: i, src: f })}
                        className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                      >
                        Annota
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={scaricaPdf}
                  disabled={pdfLoading}
                  variant="primary"
                  className="flex-1"
                >
                  {pdfLoading ? (
                    'Generazione...'
                  ) : (
                    <>
                      <Share2 size={15} className="mr-1.5" />
                      {typeof navigator !== 'undefined' && 'canShare' in navigator ? 'Condividi PDF' : 'Scarica PDF'}
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setVerbaleOpen(true)}>
                  <FileText size={15} className="mr-1.5" />
                  Modifica
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-ink-2">
                Nessun verbale. Fai firmare il cliente alla consegna per proteggerti da contestazioni.
              </p>
              <Button onClick={() => setVerbaleOpen(true)}>
                <Camera size={16} className="mr-2" />
                Apri verbale
              </Button>
            </div>
          )}
        </Card>

        {/* Operai */}
        {operai && operai.length > 0 && (
          <Card className="mb-4">
            <CardHeader title="Operai" />
            <div className="space-y-2">
              {operai.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-[14px]">
                  <span className="font-medium">{o.nome}</span>
                  {o.telefono && (
                    <a href={`tel:${o.telefono}`} className="text-primary text-[13px] font-medium">
                      {o.telefono}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Giornale di cantiere */}
        <GiornaledCantiere cantiereId={cantiere.id} />

        {/* Note cantiere */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <CardHeader title="Note" />
            <button
              onClick={apriNuovaNota}
              className="flex items-center gap-1 text-[13px] font-semibold text-primary active:opacity-70"
            >
              <Plus size={15} />
              Nuova
            </button>
          </div>
          {cantiereNotes.length === 0 ? (
            <button
              onClick={apriNuovaNota}
              className="w-full flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed border-line/60 text-ink-3 active:bg-section transition-colors"
            >
              <StickyNote size={22} className="mb-1.5" />
              <span className="text-[13px]">Aggiungi la prima nota</span>
            </button>
          ) : (
            <div className="space-y-2">
              {cantiereNotes.slice(0, 3).map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={() => { setEditNote(note); setNoteSheetOpen(true); }}
                />
              ))}
              {cantiereNotes.length > 3 && (
                <p className="text-[12px] text-ink-3 text-center pt-1">
                  +{cantiereNotes.length - 3} altre note
                </p>
              )}
            </div>
          )}
        </Card>
      </Screen>

      <CantiereForm open={editOpen} cantiere={cantiere} onClose={() => setEditOpen(false)} />
      <ContrattoSheet open={contrattoOpen} cantiere={cantiere} onClose={() => setContrattoOpen(false)} />
      <VerbaleSheet open={verbaleOpen} cantiere={cantiere} onClose={() => setVerbaleOpen(false)} />

      {annotatePhoto && (
        <PhotoAnnotator
          src={annotatePhoto.src}
          onSave={async (dataUrl) => {
            const newFoto = cantiere.foto.map((f, i) =>
              i === annotatePhoto.index ? dataUrl : f,
            );
            if (team) await saveCantiere({ ...cantiere, foto: newFoto }, team.id);
            setAnnotatePhoto(null);
          }}
          onCancel={() => setAnnotatePhoto(null)}
        />
      )}

      <NoteSheet
        open={noteSheetOpen}
        note={editNote}
        defaultProjectId={noteProjectId}
        onClose={() => setNoteSheetOpen(false)}
        onSaved={() => setNoteRefresh((v) => v + 1)}
      />
    </>
  );
}
