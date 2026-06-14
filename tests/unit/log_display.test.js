import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { beginMessage, endMessage } from '../../lib/log_display.js';

describe('log_display', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe('beginMessage', () => {
    it('logs exactly once', () => {
      beginMessage('myapp');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('includes the appName in the logged message', () => {
      beginMessage('myapp');
      const output = logSpy.mock.calls[0][0];
      expect(output).toContain('myapp');
    });

    it('mentions the app is being created', () => {
      beginMessage('demo');
      const output = logSpy.mock.calls[0][0];
      expect(output).toContain('is being created');
      expect(output).toContain('please wait');
    });

    it('handles a different appName', () => {
      beginMessage('server-x');
      const output = logSpy.mock.calls[0][0];
      expect(output).toContain('server-x');
    });

    it('handles an empty appName without throwing', () => {
      expect(() => beginMessage('')).not.toThrow();
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('endMessage', () => {
    it('logs three lines', () => {
      endMessage('myapp');
      expect(logSpy).toHaveBeenCalledTimes(3);
    });

    it('logs the cd <appName> instruction', () => {
      endMessage('myapp');
      const outputs = logSpy.mock.calls.map((c) => c[0]);
      expect(outputs.some((o) => o.includes('cd myapp'))).toBe(true);
    });

    it('logs the npm start instruction', () => {
      endMessage('myapp');
      const outputs = logSpy.mock.calls.map((c) => c[0]);
      expect(outputs.some((o) => o.includes('npm start'))).toBe(true);
    });

    it('logs a Happy Hacking message', () => {
      endMessage('myapp');
      const outputs = logSpy.mock.calls.map((c) => c[0]);
      expect(outputs.some((o) => o.includes('Happy Hacking'))).toBe(true);
    });

    it('reflects the provided appName in the cd line', () => {
      endMessage('another-app');
      const outputs = logSpy.mock.calls.map((c) => c[0]);
      expect(outputs.some((o) => o.includes('cd another-app'))).toBe(true);
    });

    it('emits the cd line as the first call', () => {
      endMessage('first-app');
      expect(logSpy.mock.calls[0][0]).toContain('cd first-app');
    });

    it('emits the npm start line as the second call', () => {
      endMessage('first-app');
      expect(logSpy.mock.calls[1][0]).toContain('npm start');
    });

    it('emits the Happy Hacking line as the third call', () => {
      endMessage('first-app');
      expect(logSpy.mock.calls[2][0]).toContain('Happy Hacking');
    });

    it('handles an empty appName without throwing', () => {
      expect(() => endMessage('')).not.toThrow();
      expect(logSpy).toHaveBeenCalledTimes(3);
    });
  });
});
