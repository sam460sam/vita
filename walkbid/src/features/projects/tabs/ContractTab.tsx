import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileSignature, ShieldCheck, ShieldAlert, Share2, MapPin, Clock, User } from 'lucide-react';
import { EmptyState, Button, Card, MoneyText } from '@/ui';
import { usDateTime } from '@/lib/format';
import { geoLabel } from '@/platform/geo';
import { contractForProject, verifyContract, type IntegrityResult } from '@/services/contracts';
import { estimateForProject } from '@/services/estimates';
import { getBlob } from '@/services/blobs';
import { shareFile } from '@/platform/share';
import { BRAND } from '@/config/brand';
import { ContractSignSheet } from '@/features/contract/ContractSignSheet';
import type { Project } from '@/data/types';

export function ContractTab({ project }: { project: Project }) {
  const contract = useLiveQuery(() => contractForProject(project.id), [project.id]);
  const estimate = useLiveQuery(() => estimateForProject(project.id), [project.id]);
  const [signOpen, setSignOpen] = useState(false);
  const [integrity, setIntegrity] = useState<IntegrityResult | null>(null);

  useEffect(() => {
    if (contract?.status === 'signed') verifyContract(contract).then(setIntegrity);
  }, [contract]);

  if (contract === undefined || estimate === undefined) return null;

  if (!contract || contract.status !== 'signed') {
    if (!estimate) {
      return <EmptyState icon={<FileSignature size={36} />} title="No estimate yet" body="Build an estimate first, then convert it to a contract." />;
    }
    return (
      <EmptyState
        icon={<FileSignature size={36} />}
        title="Not signed yet"
        body="Convert the estimate into a contract and sign it on site."
        action={<Button onClick={() => setSignOpen(true)}>Sign contract</Button>}
      />
    );
  }

  async function share() {
    if (!contract?.pdfBlobId) return;
    const rec = await getBlob(contract.pdfBlobId);
    if (rec) await shareFile(`${BRAND}_Contract_${project.title}.pdf`, rec.data, 'Signed contract');
  }

  return (
    <div className="p-4">
      {/* Integrity banner */}
      <Card className={'mb-4 ' + (integrity?.ok ? 'border-go/40' : 'border-signal/40')}>
        <div className="flex items-center gap-3 p-4">
          {integrity?.ok ? <ShieldCheck className="text-go" size={28} /> : <ShieldAlert className="text-signal" size={28} />}
          <div>
            <div className="font-display font-bold text-chalk">{integrity == null ? 'Verifying…' : integrity.ok ? 'Integrity verified' : 'Integrity check failed'}</div>
            <div className="text-xs text-dust">{integrity?.ok ? 'The stored PDF matches its signed fingerprint.' : 'The document may have been altered.'}</div>
          </div>
        </div>
      </Card>

      {/* Audit screen */}
      <Card className="mb-4">
        <div className="flex flex-col gap-3 p-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-dust">Audit</h3>
          <AuditRow icon={<User size={15} />} label="Signed by" value={`${contract.signerName}${contract.signerRole ? ` · ${contract.signerRole}` : ''}`} />
          <AuditRow icon={<Clock size={15} />} label="When" value={contract.signedAt ? usDateTime(contract.signedAt) : '—'} />
          <AuditRow icon={<MapPin size={15} />} label="Where" value={geoLabel(contract.geo)} />
          <div className="border-t border-steel pt-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-dust">SHA-256 fingerprint</div>
            <div className="tnum mt-1 break-all font-mono text-[11px] text-chalk">{contract.sha256}</div>
          </div>
        </div>
      </Card>

      {estimate && (
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-sm text-dust">Contract total</span>
          <MoneyText amount={estimate.total} size="md" />
        </div>
      )}

      <Button className="w-full" onClick={share}>
        <Share2 size={18} /> Share signed PDF
      </Button>

      {signOpen && estimate && <ContractSignSheet open={signOpen} onClose={() => setSignOpen(false)} project={project} estimate={estimate} />}
    </div>
  );
}

function AuditRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-dust">{icon}</span>
      <span className="w-20 shrink-0 text-xs text-dust">{label}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-chalk">{value}</span>
    </div>
  );
}
