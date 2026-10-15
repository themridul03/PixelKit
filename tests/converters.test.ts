import { describe, it, expect } from 'vitest';
import { exportTableToXlsx, exportTableToCsv } from '../src/lib/pdf/pdfToExcel';
import { convertTextToPdf } from '../src/lib/document/textToPdf';
import { convertSpreadsheetToPdf } from '../src/lib/document/excelToPdf';
import { formatVideoTime } from '../src/lib/ai/videoNotesToPdf';
import { detectFontFamilyCategory } from '../src/lib/pdf/pdfTextEditor';
import { PDFDocument } from 'pdf-lib';

describe('New Production Document & Conversion Engines', () => {
  describe('PDF to Excel & CSV Exporter', () => {
    const headers = ['ID', 'Product', 'Quantity', 'Price'];
    const rows = [
      ['101', 'Wireless Mouse', '2', '$29.99'],
      ['102', 'Mechanical Keyboard', '1', '$119.00'],
      ['103', 'USB-C Cable', '5', '$9.95']
    ];

    it('exports structured table data to CSV blob', async () => {
      const csvBlob = exportTableToCsv(headers, rows);
      expect(csvBlob).toBeDefined();
      expect(csvBlob.type).toContain('text/csv');
      const text = await csvBlob.text();
      expect(text).toContain('Wireless Mouse');
      expect(text).toContain('Mechanical Keyboard');
    });

    it('exports structured table data to XLSX blob', async () => {
      const xlsxBlob = exportTableToXlsx(headers, rows, 'Inventory');
      expect(xlsxBlob).toBeDefined();
      expect(xlsxBlob.size).toBeGreaterThan(100);
      expect(xlsxBlob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });

  describe('Text to PDF Converter', () => {
    it('converts multi-line markdown notes to a valid PDF Document', async () => {
      const sampleText = `# Biology Lecture Notes\n\n## Cellular Respiration\nGlycolysis occurs in the cytoplasm and breaks glucose into two pyruvate molecules.\n\n## Krebs Cycle\nOccurs in mitochondrial matrix.`;
      const result = await convertTextToPdf(sampleText, {
        title: 'Biology 101 Notes',
        pageSize: 'a4',
        orientation: 'portrait'
      });

      expect(result.pageCount).toBeGreaterThanOrEqual(1);
      expect(result.size).toBeGreaterThan(500);

      const buffer = await result.blob.arrayBuffer();
      const loaded = await PDFDocument.load(buffer);
      expect(loaded.getPageCount()).toBe(result.pageCount);
    });
  });

  describe('Excel to PDF Converter', () => {
    it('converts tabular sheet rows into formatted PDF with headers', async () => {
      const headers = ['Quarter', 'Revenue', 'Expenses', 'Profit'];
      const rows = [
        ['Q1', '$120,000', '$80,000', '$40,000'],
        ['Q2', '$145,000', '$85,000', '$60,000'],
        ['Q3', '$160,000', '$90,000', '$70,000']
      ];

      const result = await convertSpreadsheetToPdf(headers, rows, {
        title: '2026 Fiscal Financial Report',
        orientation: 'landscape',
        fontSize: 9
      });

      expect(result.pageCount).toBe(1);
      expect(result.size).toBeGreaterThan(500);

      const buffer = await result.blob.arrayBuffer();
      const loaded = await PDFDocument.load(buffer);
      expect(loaded.getPageCount()).toBe(1);
    });
  });

  describe('Video Notes Utility', () => {
    it('formats seconds into accurate MM:SS timestamps', () => {
      expect(formatVideoTime(0)).toBe('00:00');
      expect(formatVideoTime(45)).toBe('00:45');
      expect(formatVideoTime(65)).toBe('01:05');
      expect(formatVideoTime(600)).toBe('10:00');
      expect(formatVideoTime(3672)).toBe('61:12');
    });
  });

  describe('PDF Text Editor Font Preservation', () => {
    it('detects serif, sans, and monospace font families and weights', () => {
      expect(detectFontFamilyCategory('Times-Roman-Bold')).toEqual({
        category: 'serif',
        isBold: true,
        isItalic: false
      });
      expect(detectFontFamilyCategory('Helvetica-Oblique')).toEqual({
        category: 'sans',
        isBold: false,
        isItalic: true
      });
      expect(detectFontFamilyCategory('Courier-BoldOblique')).toEqual({
        category: 'mono',
        isBold: true,
        isItalic: true
      });
      expect(detectFontFamilyCategory('Arial')).toEqual({
        category: 'sans',
        isBold: false,
        isItalic: false
      });
    });
  });
});
