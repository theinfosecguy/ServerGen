import { describe, it, expect } from 'vitest';
import { validateOptions } from '../../lib/validator.js';

const validationRules = {
  frameworks: ['node', 'express'],
  views: ['ejs', 'jade', 'pug', 'hbs'],
};

describe('validateOptions', () => {
  describe('framework validation', () => {
    it('accepts valid framework: express', () => {
      const result = validateOptions({ framework: 'express' }, validationRules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts valid framework: node', () => {
      const result = validateOptions({ framework: 'node' }, validationRules);
      expect(result.isValid).toBe(true);
    });

    it('rejects invalid framework', () => {
      const result = validateOptions({ framework: 'invalid' }, validationRules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid framework');
    });

    it('passes when no framework specified', () => {
      const result = validateOptions({}, validationRules);
      expect(result.isValid).toBe(true);
    });
  });

  describe('view validation', () => {
    it('accepts valid view: ejs', () => {
      const result = validateOptions({ view: 'ejs' }, validationRules);
      expect(result.isValid).toBe(true);
    });

    it('accepts valid view: pug', () => {
      const result = validateOptions({ view: 'pug' }, validationRules);
      expect(result.isValid).toBe(true);
    });

    it('rejects invalid view', () => {
      const result = validateOptions({ view: 'invalid' }, validationRules);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid view engine');
    });

    it('passes when no view specified', () => {
      const result = validateOptions({}, validationRules);
      expect(result.isValid).toBe(true);
    });
  });

  describe('combined validation', () => {
    it('validates both framework and view', () => {
      const result = validateOptions(
        { framework: 'express', view: 'ejs' },
        validationRules
      );
      expect(result.isValid).toBe(true);
    });

    it('returns multiple errors for multiple invalid options', () => {
      const result = validateOptions(
        { framework: 'bad', view: 'worse' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});
