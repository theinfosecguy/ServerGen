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

  describe('port validation', () => {
    it('accepts a valid port', () => {
      const result = validateOptions({ port: '8080' }, validationRules);
      expect(result.isValid).toBe(true);
    });

    it('accepts the default port', () => {
      const result = validateOptions({ port: '3000' }, validationRules);
      expect(result.isValid).toBe(true);
    });

    it('rejects a port below 1', () => {
      const result = validateOptions({ port: '0' }, validationRules);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid port');
    });

    it('rejects a negative port', () => {
      const result = validateOptions({ port: '-5' }, validationRules);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid port');
    });

    it('rejects a port above 65535', () => {
      const result = validateOptions({ port: '99999' }, validationRules);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid port');
    });

    it('rejects a non-numeric port', () => {
      const result = validateOptions({ port: 'abc' }, validationRules);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid port');
    });

    it('passes when no port specified', () => {
      const result = validateOptions({}, validationRules);
      expect(result.isValid).toBe(true);
    });
  });

  describe('framework and view compatibility', () => {
    it('rejects a view engine with the node framework', () => {
      const result = validateOptions(
        { framework: 'node', view: 'ejs' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('express framework'))).toBe(true);
    });

    it('allows a view engine with the express framework', () => {
      const result = validateOptions(
        { framework: 'express', view: 'ejs' },
        validationRules
      );
      expect(result.isValid).toBe(true);
    });

    it('allows the node framework without a view engine', () => {
      const result = validateOptions({ framework: 'node' }, validationRules);
      expect(result.isValid).toBe(true);
    });

    it('rejects --db with the node framework', () => {
      const result = validateOptions(
        { framework: 'node', db: true },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('express framework'))).toBe(true);
    });

    it('allows --db with the express framework', () => {
      const result = validateOptions(
        { framework: 'express', db: true },
        validationRules
      );
      expect(result.isValid).toBe(true);
    });

    it('rejects --typescript with the node framework', () => {
      const result = validateOptions(
        { framework: 'node', typescript: true },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('express framework'))).toBe(true);
    });

    it('allows --typescript with the express framework', () => {
      const result = validateOptions(
        { framework: 'express', typescript: true },
        validationRules
      );
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
