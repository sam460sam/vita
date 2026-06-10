import { Bookmark } from 'lucide-react';
import type { Note, NoteProject } from '@/data/types';
import { contentPreview, formatNoteDate } from './note-logic';

interface Props {
  note: Note;
  project?: NoteProject;
  onClick: () => void;
}

export function NoteCard({ note, project, onClick }: Props) {
  const preview = contentPreview(note.content, 100);
  const dateLabel = formatNoteDate(note.data);
  const accentColor = project?.colore ?? '#6b7280';
  const thumb = note.attachments[0];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-2xl p-4 shadow-sm border border-line/40 active:scale-[0.98] transition-transform"
    >
      <div className="flex gap-3">
        {/* Color accent bar */}
        <div
          className="w-1 rounded-full flex-shrink-0 self-stretch min-h-[40px]"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="font-semibold text-[15px] text-ink leading-snug line-clamp-1 flex-1">
              {note.title || 'Nota senza titolo'}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {note.inAgenda && (
                <Bookmark size={14} className="text-primary fill-primary" />
              )}
              {dateLabel && (
                <span className="text-[11px] text-ink-3 font-medium">{dateLabel}</span>
              )}
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <p className="text-[13px] text-ink-2 leading-snug line-clamp-2 mb-2">
              {preview}
            </p>
          )}

          {/* Bottom row: tags + thumbnail */}
          <div className="flex items-end justify-between gap-2">
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-[11px] text-ink-3">+{note.tags.length - 3}</span>
                )}
              </div>
            )}
            {thumb && (
              <img
                src={thumb}
                alt=""
                className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-line/40"
              />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
