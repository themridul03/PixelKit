import { describe, it, expect } from 'vitest';
import { parsePageRange } from '../src/lib/pdf/splitPdf';
import { PDFDocument } from 'pdf-lib';

describe('PDF Utilities', () => {
  it('parses page ranges correctly', () => {
    const range = parsePageRange('1-3, 5, 8-10', 10);
    expect(range).toEqual([1, 2, 3, 5, 8, 9, 10]);
  });

  it('handles inverted ranges and out-of-bounds gracefully', () => {
    const range = parsePageRange('4-2, 12', 5);
    expect(range).toEqual([2, 3, 4]);
  });

  it('creates and counts pages using pdf-lib', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([400, 400]);
    pdfDoc.addPage([600, 800]);

    expect(pdfDoc.getPageCount()).toBe(2);
    const pdfBytes = await pdfDoc.save();
    expect(pdfBytes.byteLength).toBeGreaterThan(0);
  });
});
