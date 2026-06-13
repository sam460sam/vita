import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ShieldCheck, FileDown } from 'lucide-react';
import { Button, Card, useToast } from '@/ui';
import { db } from '@/data/db';
import { shareProof } from '@/services/proof';
import type { Project } from '@/data/types';

// One tap → a single PDF dossier: contract + audit, signed COs, geotagged photo
// timeline, daily logs, payments ledger, and all SHA-256 hashes (spec M5).
export function ProofTab({ project }: { project: Project }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const counts = useLiveQuery(async () => {
    const [co, ph, log, pay] = await Promise.all([
      db.changeOrders.where('projectId').equals(project.id).count(),
      db.photos.where('projectId').equals(project.id).count(),
      db.diaryEntries.where('projectId').equals(project.id).count(),
      db.payments.where('projectId').equals(project.id).count(),
    ]);
    const contract = await db.contracts.where('projectId').equals(project.id).first();
    return { co, ph, log, pay, signed: contract?.status === 'signed' };
  }, [project.id]);

  async function generate() {
    setBusy(true);
    try {
      const ok = await shareProof(project.id);
      toast.show(ok ? 'Proof package ready' : 'Add company info in Settings', ok ? 'go' : 'attention');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4">
      <Card className="mb-4">
        <div className="flex items-start gap-3 p-4">
          <ShieldCheck className="text-accent" size={28} />
          <div>
            <div className="font-display font-bold text-ink">Proof package</div>
            <p className="mt-1 text-sm text-muted">
              A single timestamped PDF for disputes, small-claims or lien support — contract, change orders, photos,
              logs, payments and every SHA-256 fingerprint.
            </p>
          </div>
        </div>
      </Card>

      {counts && (
        <Card className="mb-4">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-surface-2">
            <Stat label="Contract" value={counts.signed ? 'Signed' : 'Unsigned'} />
            <Stat label="Change orders" value={String(counts.co)} />
            <Stat label="Photos" value={String(counts.ph)} />
            <Stat label="Log entries" value={String(counts.log)} />
          </div>
        </Card>
      )}

      <Button className="w-full" onClick={generate} disabled={busy}>
        <FileDown size={18} /> {busy ? 'Building…' : 'Generate proof PDF'}
      </Button>
      <p className="mt-3 px-1 text-center text-xs text-muted">
        Mechanics-lien deadlines and rules vary by state — informational, not legal advice.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="font-display text-lg font-bold text-ink">{value}</div>
    </div>
  );
}
