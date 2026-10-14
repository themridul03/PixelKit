export interface FileHashResult {
  sha256: string;
  sha1: string;
  sizeBytes: number;
  fileName: string;
}

export async function computeFileHashes(file: File): Promise<FileHashResult> {
  const arrayBuffer = await file.arrayBuffer();

  // SHA-256
  const hash256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const sha256 = bufferToHex(hash256Buffer);

  // SHA-1
  const hash1Buffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
  const sha1 = bufferToHex(hash1Buffer);

  return {
    sha256,
    sha1,
    sizeBytes: file.size,
    fileName: file.name
  };
}

function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
