import { describe, it, expect } from 'vitest';
import { computeTextStatistics } from '../src/lib/document/textStats';
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  removeDuplicateLines,
  sortLines
} from '../src/lib/document/textTransform';
import { formatJson, minifyJson } from '../src/lib/document/jsonTools';
import { computeLineDiff } from '../src/lib/document/textDiff';

describe('Document and Text Utilities', () => {
  it('computes accurate text metrics', () => {
    const text = 'Hello world! This is PixelKit.';
    const stats = computeTextStatistics(text);
    expect(stats.words).toBe(5);
    expect(stats.characters).toBe(text.length);
    expect(stats.sentences).toBe(2);
  });

  it('transforms text cases properly', () => {
    expect(toUpperCase('hello')).toBe('HELLO');
    expect(toLowerCase('HELLO')).toBe('hello');
    expect(toTitleCase('pixelkit web tools')).toBe('Pixelkit Web Tools');
    expect(toCamelCase('pixel kit developer')).toBe('pixelKitDeveloper');
    expect(toSnakeCase('Pixel Kit developer')).toBe('pixel_kit_developer');
    expect(toKebabCase('Pixel Kit developer')).toBe('pixel-kit-developer');
  });

  it('removes duplicate lines and sorts', () => {
    const lines = 'banana\napple\nbanana\ncherry';
    const unique = removeDuplicateLines(lines);
    expect(unique).toBe('banana\napple\ncherry');

    const sorted = sortLines(unique, true);
    expect(sorted).toBe('apple\nbanana\ncherry');
  });

  it('formats and minifies JSON', () => {
    const raw = '{"a":1,"b":2}';
    const formatted = formatJson(raw, 2);
    expect(formatted.success).toBe(true);
    expect(formatted.formattedText).toContain('\n  "a": 1');

    const minified = minifyJson('{\n  "a": 1,\n  "b": 2\n}');
    expect(minified.success).toBe(true);
    expect(minified.formattedText).toBe('{"a":1,"b":2}');
  });

  it('computes line-by-line text diff', () => {
    const orig = 'Line 1\nLine 2';
    const mod = 'Line 1\nLine 2 updated';
    const diff = computeLineDiff(orig, mod);
    expect(diff.some((d) => d.type === 'unchanged' && d.content === 'Line 1')).toBe(true);
    expect(diff.some((d) => d.type === 'added')).toBe(true);
  });
});
