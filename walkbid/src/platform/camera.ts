// Camera capture — native via @capacitor/camera, web via a file input.
// Returns a JPEG Blob (or null if cancelled/denied). Permission is requested
// in-context by the plugin on first use; we degrade gracefully on denial.
import { Capacitor } from '@capacitor/core';

export async function capturePhoto(): Promise<Blob | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        correctOrientation: true,
      });
      if (!photo.webPath) return null;
      const res = await fetch(photo.webPath);
      return await res.blob();
    } catch {
      return null;
    }
  }
  // Web fallback: hidden file input with camera capture hint.
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}
