import { Camera, Gem, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import { platform } from '@/platform/platform';
import type { Tab } from './nav';

export function TabBar({
  tab,
  onTab,
  onScan,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  onScan: () => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <div className="glass mx-auto flex max-w-md items-center justify-around rounded-[26px] px-2 py-2 shadow-glass">
        <TabButton active={tab === 'home'} label="Home" onClick={() => onTab('home')} icon={<Home size={22} />} />
        <TabButton active={tab === 'collection'} label="Collection" onClick={() => onTab('collection')} icon={<Gem size={22} />} />

        {/* Center scan button */}
        <button
          aria-label="Scan a stone"
          onClick={() => {
            platform.haptic('medium');
            onScan();
          }}
          className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-gradient-amethyst text-white shadow-glow transition-transform active:scale-95"
        >
          <Camera size={26} />
        </button>

        <TabButton active={tab === 'settings'} label="Settings" onClick={() => onTab('settings')} icon={<Settings size={22} />} />
      </div>
    </nav>
  );
}

function TabButton({
  active, label, icon, onClick,
}: {
  active: boolean; label: string; icon: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-12 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors',
        active ? 'text-amethyst' : 'text-ink-3 hover:text-ink-2',
      )}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
