// Haptic feedback — on signature completed, payment marked paid, CO signed.
import { Capacitor } from '@capacitor/core';

export async function haptic(style: 'light' | 'medium' | 'heavy' | 'success' = 'medium'): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Web fallback: vibrate if supported.
    try {
      navigator.vibrate?.(style === 'success' ? [10, 40, 20] : 12);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    if (style === 'success') await Haptics.notification({ type: NotificationType.Success });
    else await Haptics.impact({ style: style === 'light' ? ImpactStyle.Light : style === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Medium });
  } catch {
    /* unavailable */
  }
}
