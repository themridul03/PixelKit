import { describe, it, expect } from 'vitest';
import { formatBytes, calculateReduction, replaceExtension } from '../src/lib/utils/format';
import { hexToRgb, rgbToHex, rgbToHsl } from '../src/lib/design/colorTools';

describe('Format and Reduction Utilities', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB');
  });

  it('calculates reduction percentage accurately', () => {
    const res = calculateReduction(1000, 250);
    expect(res.percentage).toBe(75);
    expect(res.savedBytes).toBe(750);
    expect(res.isReduced).toBe(true);

    const noReduction = calculateReduction(500, 600);
    expect(noReduction.percentage).toBe(0);
    expect(noReduction.isReduced).toBe(false);
  });

  it('replaces file extensions properly', () => {
    expect(replaceExtension('photo.jpg', 'png')).toBe('photo.png');
    expect(replaceExtension('document.min.png', 'webp')).toBe('document.min.webp');
    expect(replaceExtension('archive', '.pdf')).toBe('archive.pdf');
  });
});

describe('Color Utilities', () => {
  it('converts hex to rgb and back', () => {
    const rgb = hexToRgb('#3b82f6');
    expect(rgb).toEqual({ r: 59, g: 130, b: 246 });

    const hex = rgbToHex(59, 130, 246);
    expect(hex.toLowerCase()).toBe('#3b82f6');
  });

  it('converts rgb to hsl', () => {
    const hsl = rgbToHsl(255, 0, 0); // Pure red
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });
});
