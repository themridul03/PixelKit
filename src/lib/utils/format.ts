export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function calculateReduction(originalSize: number, newSize: number): {
  percentage: number;
  savedBytes: number;
  isReduced: boolean;
} {
  const diff = originalSize - newSize;
  const percentage = originalSize > 0 ? Math.round((diff / originalSize) * 100) : 0;
  return {
    percentage: Math.max(0, percentage),
    savedBytes: Math.max(0, diff),
    isReduced: diff > 0
  };
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function replaceExtension(filename: string, newExt: string): string {
  const base = filename.substring(0, filename.lastIndexOf('.')) || filename;
  const cleanExt = newExt.startsWith('.') ? newExt.slice(1) : newExt;
  return `${base}.${cleanExt}`;
}
