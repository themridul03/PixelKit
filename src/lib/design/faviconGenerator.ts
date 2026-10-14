import JSZip from 'jszip';
import { loadImage, imageToCanvas, canvasToBlob } from '../image/imageCore';

export interface FaviconItem {
  name: string;
  blob: Blob;
  size: number;
}

export async function generateFaviconPackage(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const zip = new JSZip();

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  for (const item of sizes) {
    const canvas = imageToCanvas(img, item.size, item.size);
    const blob = await canvasToBlob(canvas, 'image/png');
    zip.file(item.name, blob);
  }

  // Add webmanifest
  const manifest = {
    name: 'PixelKit App',
    short_name: 'App',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone'
  };
  zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

  // Add HTML snippet
  const htmlSnippet = `<!-- Favicon & Touch Icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

  zip.file('favicon-instructions.html', htmlSnippet);

  return await zip.generateAsync({ type: 'blob' });
}
