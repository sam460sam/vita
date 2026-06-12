// Native share sheet (iMessage/SMS/email are the real delivery channels) with
// a web fallback. Sharing a file writes it to the device first via Filesystem.
import { Capacitor } from '@capacitor/core';

export async function shareText(text: string, title?: string): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title, text });
      return;
    }
    await navigator.clipboard?.writeText(text);
  } catch {
    /* user cancelled or unavailable */
  }
}

/** Share a generated file (e.g. a PDF) via the native sheet. */
export async function shareFile(filename: string, data: Blob, title?: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const base64 = await blobToBase64(data);
      await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
      const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
      await Share.share({ title: title ?? filename, files: [uri] });
      return;
    } catch {
      /* fall through to web path */
    }
  }
  // Web: try Web Share with files, else trigger a download.
  try {
    const file = new File([data], filename, { type: data.type || 'application/pdf' });
    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      await navigator.share({ title: title ?? filename, files: [file] });
      return;
    }
  } catch {
    /* fall through */
  }
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
