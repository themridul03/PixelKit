import { describe, it, expect } from 'vitest';
import { TOOLS, CATEGORIES, getToolById, searchTools } from '../src/config/tools';

describe('Tool Registry Integrity', () => {
  it('has valid tool definitions with unique IDs', () => {
    const ids = new Set<string>();
    for (const tool of TOOLS) {
      expect(ids.has(tool.id)).toBe(false);
      ids.add(tool.id);

      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.route).toMatch(/^\//);
      expect(tool.category).toBeTruthy();
      expect(tool.features.length).toBeGreaterThan(0);
      expect(tool.faqs.length).toBeGreaterThan(0);
    }
  });

  it('retrieves tools by ID', () => {
    const compressor = getToolById('image-compressor');
    expect(compressor).toBeDefined();
    expect(compressor?.name).toBe('Image Compressor');
  });

  it('searches tools by keywords', () => {
    const results = searchTools('compress');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((t) => t.id === 'image-compressor')).toBe(true);
  });
});
