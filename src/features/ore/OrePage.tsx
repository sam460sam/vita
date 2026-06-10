import { Clock } from 'lucide-react';
import { CantierePageHeader as PageHeader } from '@/features/cantiere/CantierePageHeader';
import { Screen } from '@/app/Screen';
import { EmptyState } from '@/ui';

export function OrePage() {
  return (
    <>
      <PageHeader title="Ore Lavoro" />
      <Screen>
        <EmptyState
          icon={<Clock size={28} />}
          title="Sezione in arrivo"
          description="Qui potrai registrare le ore lavorate giorno per giorno, vedere il riepilogo mensile e calcolare lordo/netto. Prossimamente."
        />
      </Screen>
    </>
  );
}
