import { describe, it, expect } from 'vitest';
import { getConfig } from '../../lib/config.js';
import path from 'path';

describe('getConfig', () => {
  const baseDir = '/test/base';
  const cwd = '/test/cwd';

  it('returns configuration object', () => {
    const config = getConfig(baseDir, cwd);
    expect(config).toBeDefined();
    expect(config.paths).toBeDefined();
    expect(config.validation).toBeDefined();
    expect(config.defaults).toBeDefined();
  });

  describe('paths', () => {
    it('sets express template path', () => {
      const config = getConfig(baseDir, cwd);
      expect(config.paths.templates.express).toBe(
        path.join(baseDir, '..', 'templates', 'express')
      );
    });

    it('sets node template path', () => {
      const config = getConfig(baseDir, cwd);
      expect(config.paths.templates.node).toBe(
        path.join(baseDir, '..', 'templates', 'node')
      );
    });

    it('sets views path', () => {
      const config = getConfig(baseDir, cwd);
      expect(config.paths.templates.views).toBe(
        path.join(baseDir, '..', 'templates', 'express', 'views')
      );
    });

    it('sets cwd correctly', () => {
      const config = getConfig(baseDir, cwd);
      expect(config.paths.cwd).toBe(cwd);
    });
  });

  describe('validation rules', () => {
    it('includes valid frameworks', () => {
      const config = getConfig(baseDir, cwd);
      expect(config.validation.frameworks).toContain('node');
      expect(config.validation.frameworks).toContain('express');
    });

    it('includes valid views', () => {
      const config = getConfig(baseDir, cwd);
      expect(config.validation.views).toContain('ejs');
      expect(config.validation.views).toContain('pug');
      expect(config.validation.views).toContain('hbs');
    });
  });

  describe('defaults', () => {
    it('sets default framework to express', () => {
      const config = getConfig(baseDir, cwd);
      expect(config.defaults.framework).toBe('express');
    });

    it('sets default port to 3000', () => {
      const config = getConfig(baseDir, cwd);
      expect(config.defaults.port).toBe(3000);
    });
  });
});
