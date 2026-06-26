// ============================================================================
// Camera wrapper. Native: @capacitor/camera (real camera + gallery + prompts
// for permission). Web/dev: falls back to a hidden <input> so the whole flow
// is testable in a browser.
// ============================================================================
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export type PhotoSource = 'camera' | 'photos';

/** Returns a data URL (image/jpeg or png) or null if the user cancelled. */
export async function takePhoto(source: PhotoSource): Promise<string | null> {
  if (isNative) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        // Capture at a generous size; we downscale client-side before upload.
        width: 1600,
        correctOrientation: true,
        promptLabelHeader: 'Add a photo',
        promptLabelPhoto: 'Choose from gallery',
        promptLabelPicture: 'Take a photo',
      });
      return photo.dataUrl ?? null;
    } catch {
      // user cancelled or permission denied
      return null;
    }
  }

  // Web fallback — file input (camera capture hint on mobile browsers).
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (source === 'camera') input.capture = 'environment';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    // If the user dismisses the picker, there's no reliable cancel event;
    // that's fine — the promise just never resolves and the UI stays put.
    input.click();
  });
}
