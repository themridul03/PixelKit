import { PDFDocument, PageSizes, rgb, StandardFonts } from 'pdf-lib';
import { canvasToBlob } from '../image/imageCore';

export interface VideoNoteSnapshot {
  id: string;
  timestampSeconds: number;
  timestampFormatted: string;
  imageBlob: Blob;
  imageDataUrl: string;
  noteText: string;
}

export function formatVideoTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(mins)}:${pad(secs)}`;
}

export async function captureVideoFrame(
  video: HTMLVideoElement
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const canvas = document.createElement('canvas');
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 360;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context for video capture');

  ctx.drawImage(video, 0, 0, w, h);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.88);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

  return { blob, dataUrl, width: w, height: h };
}

export async function generateVideoNotesPdf(
  title: string,
  snapshots: VideoNoteSnapshot[]
): Promise<{ blob: Blob; pageCount: number; size: number }> {
  if (snapshots.length === 0) {
    throw new Error('At least one snapshot is required to generate video notes PDF');
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageW = PageSizes.A4[0];
  const pageH = PageSizes.A4[1];
  const margin = 40;
  const usableW = pageW - margin * 2;

  // 2 snapshots per page for clean study guide layout
  const itemsPerPage = 2;
  const totalPages = Math.ceil(snapshots.length / itemsPerPage);

  for (let p = 0; p < totalPages; p++) {
    const page = pdfDoc.addPage([pageW, pageH]);
    let currentY = pageH - margin;

    // Header on Page 1
    if (p === 0) {
      page.drawText(title || 'Video Lecture Notes & Study Guide', {
        x: margin,
        y: currentY - 14,
        size: 16,
        font: boldFont,
        color: rgb(0.1, 0.2, 0.5)
      });
      page.drawText(`Generated with PixelKit • ${snapshots.length} Captured Timestamp Notes`, {
        x: margin,
        y: currentY - 28,
        size: 9,
        font,
        color: rgb(0.4, 0.45, 0.5)
      });
      page.drawLine({
        start: { x: margin, y: currentY - 36 },
        end: { x: pageW - margin, y: currentY - 36 },
        thickness: 1,
        color: rgb(0.85, 0.88, 0.92)
      });
      currentY -= 50;
    }

    const pageSnapshots = snapshots.slice(p * itemsPerPage, (p + 1) * itemsPerPage);

    for (const snap of pageSnapshots) {
      // 1. Embed image
      const arrayBuffer = await snap.imageBlob.arrayBuffer();
      const embeddedImg = await pdfDoc.embedJpg(new Uint8Array(arrayBuffer));

      // Calculate screenshot aspect ratio
      const imgW = 200;
      const imgH = 120;

      // Card boundary box
      const cardH = 145;
      page.drawRectangle({
        x: margin,
        y: currentY - cardH,
        width: usableW,
        height: cardH,
        color: rgb(0.98, 0.99, 1.0),
        borderColor: rgb(0.88, 0.9, 0.94),
        borderWidth: 0.8
      });

      // Draw Screenshot
      page.drawImage(embeddedImg, {
        x: margin + 12,
        y: currentY - cardH + 12,
        width: imgW,
        height: imgH
      });

      // Timestamp Badge
      const badgeText = `⏱ Timestamp: ${snap.timestampFormatted}`;
      page.drawRectangle({
        x: margin + imgW + 24,
        y: currentY - 30,
        width: 140,
        height: 18,
        color: rgb(0.15, 0.4, 0.9)
      });
      page.drawText(badgeText, {
        x: margin + imgW + 30,
        y: currentY - 26,
        size: 8.5,
        font: boldFont,
        color: rgb(1, 1, 1)
      });

      // Note text (wrap lines)
      const noteX = margin + imgW + 24;
      const noteMaxW = usableW - imgW - 36;
      let noteY = currentY - 48;

      const words = (snap.noteText || 'No notes added for this timestamp.').split(/\s+/);
      let curLine = '';

      for (const w of words) {
        const test = curLine ? `${curLine} ${w}` : w;
        if (font.widthOfTextAtSize(test, 9) <= noteMaxW) {
          curLine = test;
        } else {
          if (curLine) {
            page.drawText(curLine, {
              x: noteX,
              y: noteY,
              size: 9,
              font,
              color: rgb(0.2, 0.2, 0.2)
            });
            noteY -= 13;
          }
          curLine = w;
        }
      }
      if (curLine && noteY > currentY - cardH + 10) {
        page.drawText(curLine, {
          x: noteX,
          y: noteY,
          size: 9,
          font,
          color: rgb(0.2, 0.2, 0.2)
        });
      }

      currentY -= cardH + 20;
    }

    // Footer page number
    const footerText = `Page ${p + 1} of ${totalPages} • PixelKit Video Notes`;
    const fW = font.widthOfTextAtSize(footerText, 8.5);
    page.drawText(footerText, {
      x: (pageW - fW) / 2,
      y: margin / 2,
      size: 8.5,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  return {
    blob,
    pageCount: totalPages,
    size: blob.size
  };
}
