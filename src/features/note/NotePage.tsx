import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { StickyNote, Plus, Search, FolderOpen, ChevronDown } from 'lucide-react';
import { CantierePageHeader as PageHeader } from '@/features/cantiere/CantierePageHeader';
import { Screen } from '@/app/Screen';
import { EmptyState, Segmented } from '@/ui';
import {
  getNotes,
  getNotesByDate,
  getInAgendaNotes,
  searchNotes,
  getNoteProjects,
  ensureInboxProject,
  INBOX_ID,
} from '@/data/note-repo';
import type { Note, NoteProject } from '@/data/types';
import { NoteCard } from './NoteCard';
import { NoteSheet } from './NoteSheet';
import { NoteProjectSheet } from './NoteProjectSheet';

type Tab = 'tutte' | 'oggi' | 'agenda' | 'cerca';

const TABS: { value: Tab; label: string }[] = [
  { value: 'tutte',  label: 'Tutte'    },
  { value: 'oggi',   label: 'Oggi'     },
  { value: 'agenda', label: 'Agenda'   },
  { value: 'cerca',  label: 'Cerca'    },
];

export function NotePage() {
  const [tab, setTab] = useState<Tab>('tutte');
  const [query, setQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [projectSheetOpen, setProjectSheetOpen] = useState(false);
  const [editProject, setEditProject] = useState<NoteProject | null>(null);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => { ensureInboxProject(); }, []);

  const projects = useLiveQuery(() => getNoteProjects(), [refresh]) ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const allNotes = useLiveQuery(
    () => getNotes(selectedProjectId),
    [selectedProjectId, refresh],
  ) ?? [];

  const todayNotes = useLiveQuery(
    () => getNotesByDate(today),
    [today, refresh],
  ) ?? [];

  const agendaNotes = useLiveQuery(
    () => getInAgendaNotes(),
    [refresh],
  ) ?? [];

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    const results = await searchNotes(q);
    setSearchResults(results);
  }, []);

  useEffect(() => {
    if (tab === 'cerca') handleSearch(query);
  }, [query, tab, handleSearch]);

  function getProjectById(id: string): NoteProject | undefined {
    return projects.find((p) => p.id === id);
  }

  function activeNotes(): Note[] {
    switch (tab) {
      case 'oggi':   return todayNotes;
      case 'agenda': return agendaNotes;
      case 'cerca':  return searchResults;
      default:       return allNotes;
    }
  }

  function openNewNote() {
    setEditNote(null);
    setSheetOpen(true);
  }

  function openEditNote(note: Note) {
    setEditNote(note);
    setSheetOpen(true);
  }

  const notes = activeNotes();
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : undefined;

  return (
    <>
      <PageHeader
        title="Note"
        action={
          <button
            onClick={() => { setEditProject(null); setProjectSheetOpen(true); }}
            className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section"
            aria-label="Nuovo progetto"
          >
            <FolderOpen size={20} />
          </button>
        }
      />
      <Screen>
        {/* Project filter pill */}
        <div className="mb-3">
          <button
            onClick={() => setProjectPickerOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border border-line/60 bg-card text-ink-2 active:bg-section transition-colors"
            style={selectedProject ? { color: selectedProject.colore, borderColor: selectedProject.colore + '60' } : undefined}
          >
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedProject?.colore ?? '#6b7280' }}
            />
            {selectedProject?.nome ?? 'Tutti i progetti'}
            <ChevronDown size={13} />
          </button>

          {projectPickerOpen && (
            <div className="mt-2 bg-card border border-line/60 rounded-2xl shadow-lg overflow-hidden">
              <button
                onClick={() => { setSelectedProjectId(undefined); setProjectPickerOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-ink hover:bg-section transition-colors border-b border-line/40"
              >
                <span className="h-3 w-3 rounded-full bg-ink-3 flex-shrink-0" />
                Tutti i progetti
              </button>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProjectId(p.id); setProjectPickerOpen(false); }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-[14px] font-medium text-ink hover:bg-section transition-colors last:border-0 border-b border-line/40"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.colore }}
                    />
                    {p.nome}
                  </div>
                  {p.id !== INBOX_ID && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditProject(p);
                        setProjectPickerOpen(false);
                        setProjectSheetOpen(true);
                      }}
                      className="text-[12px] text-ink-3 px-2 py-0.5 rounded hover:bg-section"
                    >
                      Modifica
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Segmented
          value={tab}
          onChange={(v) => { setTab(v as Tab); setProjectPickerOpen(false); }}
          options={TABS}
          className="mb-4"
        />

        {/* Search input */}
        {tab === 'cerca' && (
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca nelle note…"
              className="w-full bg-section rounded-xl pl-9 pr-4 py-2.5 text-[14px] text-ink placeholder:text-ink-3 border border-line/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}

        {/* Note list */}
        {notes.length === 0 ? (
          <EmptyState
            icon={<StickyNote size={28} />}
            title={emptyTitle(tab, query)}
            description={emptyDescription(tab)}
          />
        ) : (
          <div className="space-y-3 pb-28">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                project={getProjectById(note.projectId)}
                onClick={() => openEditNote(note)}
              />
            ))}
          </div>
        )}
      </Screen>

      {/* FAB */}
      <button
        onClick={openNewNote}
        aria-label="Nuova nota"
        className="fixed bottom-24 right-4 z-20 h-14 w-14 rounded-full bg-[var(--c-note)] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus size={26} />
      </button>

      {/* Sheets */}
      <NoteSheet
        open={sheetOpen}
        note={editNote}
        defaultProjectId={selectedProjectId}
        onClose={() => setSheetOpen(false)}
        onSaved={() => setRefresh((v) => v + 1)}
      />
      <NoteProjectSheet
        open={projectSheetOpen}
        project={editProject}
        onClose={() => setProjectSheetOpen(false)}
        onSaved={() => setRefresh((v) => v + 1)}
      />
    </>
  );
}

function emptyTitle(tab: Tab, query: string): string {
  if (tab === 'cerca' && query) return 'Nessun risultato';
  if (tab === 'oggi')   return 'Nessuna nota oggi';
  if (tab === 'agenda') return 'Nessuna nota in agenda';
  return 'Nessuna nota';
}

function emptyDescription(tab: Tab): string {
  if (tab === 'oggi')   return 'Le note con data di oggi appariranno qui.';
  if (tab === 'agenda') return "Aggiungi una nota all'agenda con il segnalibro.";
  if (tab === 'cerca')  return 'Prova a cercare per titolo, contenuto o #tag.';
  return 'Premi + per creare la tua prima nota.';
}
