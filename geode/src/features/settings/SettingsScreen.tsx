// ============================================================================
// Settings (BUILD-SPEC §2.10) — restore, legal links, notifications, AI info,
// support, export collection, version. Plus an explicit "Unlock Pro" entry so a
// reviewer can always reach the paywall.
// ============================================================================
import { useEffect, useState } from 'react';
import {
  Bell, ChevronRight, Crown, Download, FileText, Info, Mail, RotateCcw, ShieldCheck, Sparkles,
} from 'lucide-react';
import { Card, SectionTitle, useToast } from '@/ui';
import { CONFIG } from '@/lib/config';
import { settingsRepo, stonesRepo } from '@/data/repo';
import type { Settings } from '@/data/types';
import { platform } from '@/platform/platform';
import { notifications } from '@/platform/notifications';
import { purchases } from '@/platform/purchases';
import { useAppState } from '@/state/AppState';
import { useNav } from '@/app/nav';

const APP_VERSION = '1.0.0';

export function SettingsScreen() {
  const toast = useToast();
  const { isPro, setPro, refresh } = useAppState();
  const { openPaywall } = useNav();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    void settingsRepo.get().then(setSettings);
  }, []);

  const update = async (patch: Partial<Settings>) => {
    const next = await settingsRepo.update(patch);
    setSettings(next);
    return next;
  };

  const toggleCare = async (on: boolean) => {
    if (on && notifications.supported()) {
      const ok = await notifications.requestPermission();
      if (!ok) {
        toast.show('Enable notifications in iOS Settings first');
        return;
      }
    }
    const next = await update({ careReminders: on });
    await notifications.setCareReminder(on, next.careReminderTime);
  };

  const toggleSod = async (on: boolean) => {
    if (on && notifications.supported()) {
      const ok = await notifications.requestPermission();
      if (!ok) {
        toast.show('Enable notifications in iOS Settings first');
        return;
      }
    }
    await update({ stoneOfDayReminder: on });
    await notifications.setStoneOfDay(on);
  };

  const restore = async () => {
    const ok = await purchases.restore();
    if (ok) setPro(true);
    await refresh();
    toast.show(ok ? 'Purchases restored' : 'No purchases found');
  };

  const exportCollection = async () => {
    const json = await stonesRepo.exportJson();
    await platform.saveTextFile(`geode-collection-${Date.now()}.json`, json);
    toast.show('Collection exported');
  };

  const contact = () => {
    window.location.href = `mailto:${CONFIG.supportEmail}?subject=Geode%20support`;
  };

  if (!settings) return null;

  return (
    <div className="px-4 pt-[max(20px,env(safe-area-inset-top))] pb-tab">
      <h1 className="mb-5 text-[26px] font-bold text-ink">Settings</h1>

      {/* Pro status */}
      {isPro ? (
        <Card glass className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-amethyst text-white">
            <Crown size={20} />
          </div>
          <div>
            <div className="text-[15px] font-bold text-ink">Geode Pro is active</div>
            <div className="text-[13px] text-ink-3">Thanks for your support ✨</div>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => openPaywall('manual')}
          className="mb-6 flex w-full items-center gap-3 rounded-card bg-gradient-amethyst p-4 text-left text-white shadow-glow"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Crown size={20} />
          </div>
          <div>
            <div className="text-[15px] font-bold">Unlock Geode Pro</div>
            <div className="text-[13px] text-white/80">Unlimited scans & full details</div>
          </div>
          <ChevronRight size={20} className="ml-auto opacity-70" />
        </button>
      )}

      {/* Notifications */}
      <SectionTitle className="mb-2">Reminders</SectionTitle>
      <Card className="mb-6 divide-y divide-line p-0">
        <ToggleRow
          icon={<Sparkles size={18} />}
          title="Care reminder"
          subtitle="Weekly nudge to cleanse & recharge"
          value={settings.careReminders}
          onChange={toggleCare}
        />
        {settings.careReminders && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] text-ink-2">Time</span>
            <input
              type="time"
              value={settings.careReminderTime}
              onChange={async (e) => {
                const next = await update({ careReminderTime: e.target.value });
                await notifications.setCareReminder(next.careReminders, next.careReminderTime);
              }}
              className="rounded-lg bg-white/5 px-2 py-1 text-[14px] text-ink outline-none"
            />
          </div>
        )}
        <ToggleRow
          icon={<Bell size={18} />}
          title="Stone of the Day"
          subtitle="A daily crystal at 9:00"
          value={settings.stoneOfDayReminder}
          onChange={toggleSod}
        />
      </Card>

      {/* Data */}
      <SectionTitle className="mb-2">Your data</SectionTitle>
      <Card className="mb-6 divide-y divide-line p-0">
        <LinkRow icon={<Download size={18} />} title="Export collection (JSON)" onClick={exportCollection} />
        <LinkRow icon={<RotateCcw size={18} />} title="Restore purchases" onClick={restore} />
      </Card>

      {/* About / legal */}
      <SectionTitle className="mb-2">About</SectionTitle>
      <Card className="mb-6 divide-y divide-line p-0">
        <LinkRow icon={<ShieldCheck size={18} />} title="How the AI works" subtitle={`Powered by ${CONFIG.aiProviderName}`} onClick={() => showAiInfo(toast)} />
        <LinkRow icon={<FileText size={18} />} title="Terms of Use (EULA)" onClick={() => openExternal(CONFIG.termsUrl)} />
        <LinkRow icon={<FileText size={18} />} title="Privacy Policy" onClick={() => openExternal(CONFIG.privacyUrl)} />
        <LinkRow icon={<Mail size={18} />} title="Contact support" subtitle={CONFIG.supportEmail} onClick={contact} />
        <div className="flex items-center gap-3 px-4 py-3.5 text-ink-3">
          <Info size={18} />
          <span className="text-[14px]">Version</span>
          <span className="ml-auto text-[14px]">{APP_VERSION}</span>
        </div>
      </Card>

      <p className="px-2 text-center text-[12px] leading-relaxed text-ink-3">
        Identification is an AI-generated estimate and may be wrong. Not for safety, medical, or high-value
        buying/selling decisions. {CONFIG.appName} stores your collection only on this device.
      </p>
    </div>
  );
}

function ToggleRow({
  icon, title, subtitle, value, onChange,
}: {
  icon: React.ReactNode; title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-2">{icon}</span>
      <div className="min-w-0">
        <div className="text-[15px] font-medium text-ink">{title}</div>
        {subtitle && <div className="text-[12px] text-ink-3">{subtitle}</div>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={'ml-auto h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors ' + (value ? 'bg-amethyst' : 'bg-white/15')}
      >
        <span className={'block h-6 w-6 rounded-full bg-white transition-transform ' + (value ? 'translate-x-5' : 'translate-x-0')} />
      </button>
    </div>
  );
}

function LinkRow({
  icon, title, subtitle, onClick,
}: {
  icon: React.ReactNode; title: string; subtitle?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03]">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-2">{icon}</span>
      <div className="min-w-0">
        <div className="text-[15px] font-medium text-ink">{title}</div>
        {subtitle && <div className="line-clamp-1 text-[12px] text-ink-3">{subtitle}</div>}
      </div>
      <ChevronRight size={18} className="ml-auto text-ink-3" />
    </button>
  );
}

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener');
}

function showAiInfo(toast: { show: (m: string) => void }) {
  toast.show(`Photos are analyzed by ${CONFIG.aiProviderName}. We never store them on our servers.`);
}
