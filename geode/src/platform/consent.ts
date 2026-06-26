// ============================================================================
// AI consent + onboarding flags, stored via @capacitor/preferences (native) or
// localStorage (web). Apple requires explicit consent before sending a photo to
// a third-party AI provider (BUILD-SPEC §2.3).
// ============================================================================
import { Preferences } from '@capacitor/preferences';

const K_AI_CONSENT = 'geode.aiConsent';
const K_ONBOARDED = 'geode.onboarded';

async function getFlag(key: string): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key });
    return value === 'true';
  } catch {
    return false;
  }
}
async function setFlag(key: string, val: boolean): Promise<void> {
  try {
    await Preferences.set({ key, value: val ? 'true' : 'false' });
  } catch {
    /* noop */
  }
}

export const consent = {
  hasAiConsent: () => getFlag(K_AI_CONSENT),
  setAiConsent: (v: boolean) => setFlag(K_AI_CONSENT, v),
  hasOnboarded: () => getFlag(K_ONBOARDED),
  setOnboarded: (v: boolean) => setFlag(K_ONBOARDED, v),
};
