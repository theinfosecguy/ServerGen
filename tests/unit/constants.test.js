import { describe, it, expect } from 'vitest';
import {
  LOG_LEVELS,
  VIEW_ENGINES,
  VALID_VIEWS,
  DEPENDENCY_VERSIONS,
} from '../../lib/constants.js';

describe('constants', () => {
  describe('LOG_LEVELS', () => {
    it('defines ERROR as 0', () => {
      expect(LOG_LEVELS.ERROR).toBe(0);
    });

    it('defines WARN as 1', () => {
      expect(LOG_LEVELS.WARN).toBe(1);
    });

    it('defines INFO as 2', () => {
      expect(LOG_LEVELS.INFO).toBe(2);
    });

    it('defines DEBUG as 3', () => {
      expect(LOG_LEVELS.DEBUG).toBe(3);
    });
  });

  describe('VIEW_ENGINES', () => {
    it('includes ejs', () => {
      expect(VIEW_ENGINES.ejs).toBeDefined();
    });

    it('includes pug', () => {
      expect(VIEW_ENGINES.pug).toBeDefined();
    });

    it('includes hbs', () => {
      expect(VIEW_ENGINES.hbs).toBeDefined();
    });

    it('does not include deprecated jade', () => {
      expect(VIEW_ENGINES.jade).toBeUndefined();
    });
  });

  describe('VALID_VIEWS', () => {
    it('is array of view engine names', () => {
      expect(VALID_VIEWS).toContain('ejs');
      expect(VALID_VIEWS).toContain('pug');
      expect(VALID_VIEWS).toContain('hbs');
    });

    it('matches VIEW_ENGINES keys', () => {
      expect(VALID_VIEWS).toEqual(Object.keys(VIEW_ENGINES));
    });
  });

  describe('DEPENDENCY_VERSIONS', () => {
    it('includes nodemon', () => {
      expect(DEPENDENCY_VERSIONS.nodemon).toBeDefined();
    });

    it('includes cors', () => {
      expect(DEPENDENCY_VERSIONS.cors).toBeDefined();
    });

    it('includes express', () => {
      expect(DEPENDENCY_VERSIONS.express).toBeDefined();
    });

    it('includes mongoose', () => {
      expect(DEPENDENCY_VERSIONS.mongoose).toBeDefined();
    });
  });
});
