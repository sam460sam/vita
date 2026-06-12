// SHA-256 via WebCrypto. Used to fingerprint signed PDF bytes for the audit
// trail and to re-verify document integrity after export/import.
export async function sha256Hex(data: Uint8Array | ArrayBuffer | Blob): Promise<string> {
  const source = data instanceof Blob ? await data.arrayBuffer() : data;
  const digest = await crypto.subtle.digest('SHA-256', source as BufferSource);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
