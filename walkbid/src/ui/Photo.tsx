import { useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { blobUrl } from '@/services/blobs';
import { cn } from '@/lib/cn';
import type { Photo } from '@/data/types';

export function PhotoThumb({ blobId, className, onClick }: { blobId: string; className?: string; onClick?: () => void }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let live = true;
    let made: string | undefined;
    blobUrl(blobId).then((u) => {
      if (live) {
        setUrl(u);
        made = u;
      } else if (u) URL.revokeObjectURL(u);
    });
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [blobId]);
  return (
    <div className={cn('overflow-hidden rounded-card border border-hairline bg-surface', className)} onClick={onClick}>
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
    </div>
  );
}

interface StripProps {
  photos: Photo[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
}

// Horizontal scroll of geotagged site photos with an optional add tile.
export function PhotoStrip({ photos, onAdd, onRemove }: StripProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-card border border-dashed border-hairline text-muted active:bg-surface-2"
        >
          <Camera size={20} />
          <span className="text-[10px] font-semibold">Photo</span>
        </button>
      )}
      {photos.map((p) => (
        <div key={p.id} className="relative shrink-0">
          <PhotoThumb blobId={p.blobId} className="h-20 w-20" />
          {onRemove && (
            <button
              onClick={() => onRemove(p.id)}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white"
              aria-label="Remove"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
