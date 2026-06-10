import { parseContent, toggleCheckbox } from './note-logic';

interface Props {
  content: string;
  /** Called with the updated content string when a checkbox is toggled. */
  onToggle?: (newContent: string) => void;
  className?: string;
}

export function NoteContentRenderer({ content, onToggle, className }: Props) {
  const blocks = parseContent(content);

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={i} className="text-[20px] font-bold text-ink leading-snug mt-3 mb-1 first:mt-0">
                {renderInline(block.text)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={i} className="text-[16px] font-semibold text-ink leading-snug mt-3 mb-1 first:mt-0">
                {renderInline(block.text)}
              </h2>
            );
          case 'bullet':
            return (
              <div key={i} className="flex items-start gap-2 py-0.5 text-[14px] text-ink">
                <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-ink-3 flex-shrink-0" />
                <span>{renderInline(block.text)}</span>
              </div>
            );
          case 'checkbox':
            return (
              <label
                key={i}
                className="flex items-start gap-2.5 py-0.5 text-[14px] text-ink cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={block.checked}
                  onChange={() => onToggle?.(toggleCheckbox(content, block.lineIndex))}
                  className="mt-0.5 h-4 w-4 rounded accent-primary flex-shrink-0"
                  readOnly={!onToggle}
                />
                <span className={block.checked ? 'line-through text-ink-3' : ''}>
                  {renderInline(block.text)}
                </span>
              </label>
            );
          case 'paragraph':
          default:
            if (!block.text.trim()) return <div key={i} className="h-2" />;
            return (
              <p key={i} className="text-[14px] text-ink leading-relaxed">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

/** Render inline text — highlights #tags as colored chips. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(#[a-zA-Z0-9_\-àèéìòùÀÈÉÌÒÙ]+)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('#') ? (
          <span
            key={i}
            className="inline-block text-[12px] font-medium text-primary bg-primary/10 rounded px-1 py-0.5 mx-0.5 align-baseline"
          >
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}
