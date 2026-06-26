import { describe, it, expect } from 'vitest';
import { validateOptions } from '../../lib/validator.js';

const validationRules = {
  frameworks: ['node', 'express', 'hono'],
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

    it('accepts valid framework: hono', () => {
      const result = validateOptions({ framework: 'hono' }, validationRules);
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
        { framework: 'node', db: 'mongodb' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('express framework'))).toBe(true);
    });

    it('rejects --db with the hono framework', () => {
      const result = validateOptions(
        { framework: 'hono', db: 'mongodb' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('express framework'))).toBe(true);
    });

    it('allows --db mongodb with the express framework', () => {
      const result = validateOptions(
        { framework: 'express', db: 'mongodb' },
        validationRules
      );
      expect(result.isValid).toBe(true);
    });

    it('rejects the legacy boolean database shortcut', () => {
      const result = validateOptions(
        { framework: 'express', db: true },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid database'))).toBe(true);
    });

    it('allows explicit mongodb with the express framework', () => {
      const result = validateOptions(
        { framework: 'express', db: 'mongodb' },
        validationRules
      );
      expect(result.isValid).toBe(true);
    });

    it('allows postgres with prisma for Express TypeScript apps', () => {
      const result = validateOptions(
        { framework: 'express', typescript: true, db: 'postgres', orm: 'prisma' },
        validationRules
      );
      expect(result.isValid).toBe(true);
    });

    it('rejects postgres without prisma', () => {
      const result = validateOptions(
        { framework: 'express', typescript: true, db: 'postgres' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('requires --orm prisma'))).toBe(true);
    });

    it('rejects postgres without TypeScript', () => {
      const result = validateOptions(
        { framework: 'express', db: 'postgres', orm: 'prisma' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('requires --typescript'))).toBe(true);
    });

    it('rejects postgres with views', () => {
      const result = validateOptions(
        {
          framework: 'express',
          typescript: true,
          db: 'postgres',
          orm: 'prisma',
          view: 'ejs',
        },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('does not support --view'))).toBe(true);
    });

    it('rejects --orm without postgres', () => {
      const result = validateOptions(
        { framework: 'express', db: 'mongodb', orm: 'prisma' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('--orm option'))).toBe(true);
    });

    it('rejects invalid database values', () => {
      const result = validateOptions(
        { framework: 'express', db: 'mysql' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid database'))).toBe(true);
    });

    it('rejects invalid ORM values', () => {
      const result = validateOptions(
        { framework: 'express', db: 'postgres', orm: 'sequelize' },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid ORM'))).toBe(true);
    });

    it('rejects --openapi with the node framework', () => {
      const result = validateOptions(
        { framework: 'node', openapi: true },
        validationRules
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('--openapi option'))).toBe(true);
    });

    it('allows --openapi with the hono framework', () => {
      const result = validateOptions(
        { framework: 'hono', openapi: true },
        validationRules
      );
      expect(result.isValid).toBe(true);
    });

    it('allows --openapi with the express framework', () => {
      const result = validateOptions(
        { framework: 'express', openapi: true },
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
      expect(result.errors.some((e) => e.includes('express and hono frameworks'))).toBe(true);
    });

    it('allows --typescript with the express framework', () => {
      const result = validateOptions(
        { framework: 'express', typescript: true },
        validationRules
      );
      expect(result.isValid).toBe(true);
    });

    it('allows --typescript with the hono framework', () => {
      const result = validateOptions(
        { framework: 'hono', typescript: true },
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
