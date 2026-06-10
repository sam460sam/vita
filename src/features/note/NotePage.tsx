import { StickyNote } from 'lucide-react';
import { CantierePageHeader as PageHeader } from '@/features/cantiere/CantierePageHeader';
import { Screen } from '@/app/Screen';
import { EmptyState } from '@/ui';

export function NotePage() {
  return (
    <>
      <PageHeader title="Note" />
      <Screen>
        <EmptyState
          icon={<StickyNote size={28} />}
          title="Le tue note cantiere"
          description="Qui potrai organizzare note e appunti per ogni cantiere con timeline, allegati e checklist. Prossimamente."
        />
      </Screen>
    </>
  );
}
