import { useState, useEffect } from 'react';
import { CantierePageHeader as PageHeader } from '@/features/cantiere/CantierePageHeader';
import { Screen } from '@/app/Screen';
import { Segmented } from '@/ui';
import { getWorkProfile } from '@/data/ore-repo';
import type { WorkProfile } from '@/data/types';
import { DEFAULT_PROFILE } from '@/data/ore-repo';
import { OreCalendario } from './OreCalendario';
import { OreRiepilogo } from './OreRiepilogo';
import { OreImpresa } from './OreImpresa';
import { OreProfilo } from './OreProfilo';

type Tab = 'calendario' | 'riepilogo' | 'team' | 'profilo';

export function OrePage() {
  const [tab, setTab] = useState<Tab>('calendario');
  const [profile, setProfile] = useState<WorkProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    getWorkProfile().then(setProfile);
  }, []);

  return (
    <>
      <PageHeader title="Ore Lavoro" />
      <Screen>
        <div className="mb-4">
          <Segmented<Tab>
            options={[
              { value: 'calendario', label: 'Calendario' },
              { value: 'riepilogo',  label: 'Riepilogo' },
              { value: 'team',       label: 'Team' },
              { value: 'profilo',    label: 'Profilo' },
            ]}
            value={tab}
            onChange={setTab}
            className="w-full"
          />
        </div>

        {tab === 'calendario' && <OreCalendario profile={profile} />}
        {tab === 'riepilogo'  && <OreRiepilogo profile={profile} />}
        {tab === 'team'       && <OreImpresa profile={profile} />}
        {tab === 'profilo'    && (
          <OreProfilo
            profile={profile}
            onSaved={(updated) => setProfile(updated)}
          />
        )}
      </Screen>
    </>
  );
}
