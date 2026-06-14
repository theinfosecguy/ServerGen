import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LOG_LEVELS,
  setLevel,
  enableDebug,
  error,
  warn,
  info,
  success,
  debug,
  step,
} from '../../lib/logger.js';

describe('logger', () => {
  let logSpy;
  let errorSpy;
  let warnSpy;

  beforeEach(() => {
    // Reset the module-level level so each test is independent.
    setLevel(LOG_LEVELS.INFO);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  describe('exported LOG_LEVELS', () => {
    it('re-exports the LOG_LEVELS enum from constants', () => {
      expect(LOG_LEVELS).toEqual({ ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 });
    });
  });

  describe('setLevel', () => {
    it('changes the active level so lower-priority logs are suppressed', () => {
      setLevel(LOG_LEVELS.ERROR);
      info('hello');
      warn('careful');
      error('boom');
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('changes the active level so higher verbosity logs are enabled', () => {
      setLevel(LOG_LEVELS.DEBUG);
      debug('trace');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('enableDebug', () => {
    it('sets the active level to DEBUG so debug output prints', () => {
      enableDebug();
      debug('trace');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('allows every log type to emit once DEBUG is enabled', () => {
      enableDebug();
      error('e');
      warn('w');
      info('i');
      success('s');
      debug('d');
      step('st');
      // error -> console.error
      expect(errorSpy).toHaveBeenCalledTimes(1);
      // warn -> console.warn
      expect(warnSpy).toHaveBeenCalledTimes(1);
      // info, success, debug, step -> console.log (4 calls)
      expect(logSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('error', () => {
    it('prints at ERROR level via console.error', () => {
      setLevel(LOG_LEVELS.ERROR);
      error('something failed');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('[ERROR] something failed');
    });

    it('prints at INFO level (INFO >= ERROR)', () => {
      setLevel(LOG_LEVELS.INFO);
      error('oops');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('does not print the error stack when level is below DEBUG', () => {
      setLevel(LOG_LEVELS.INFO);
      const err = new Error('detailed failure');
      error('top-level message', err);
      // Only the message line, not the stack line.
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('[ERROR] top-level message');
    });

    it('prints the error stack when level is DEBUG and an error is provided', () => {
      setLevel(LOG_LEVELS.DEBUG);
      const err = new Error('detailed failure');
      error('top-level message', err);
      expect(errorSpy).toHaveBeenCalledTimes(2);
      expect(errorSpy.mock.calls[0][0]).toContain('[ERROR] top-level message');
      expect(errorSpy.mock.calls[1][0]).toContain(err.stack);
    });

    it('falls back to error.message when stack is missing at DEBUG level', () => {
      setLevel(LOG_LEVELS.DEBUG);
      const err = { message: 'no stack here' };
      error('top-level message', err);
      expect(errorSpy).toHaveBeenCalledTimes(2);
      expect(errorSpy.mock.calls[1][0]).toContain('no stack here');
    });

    it('does not print the stack at DEBUG level when no error object is passed', () => {
      setLevel(LOG_LEVELS.DEBUG);
      error('just a message');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('warn', () => {
    it('prints at WARN level', () => {
      setLevel(LOG_LEVELS.WARN);
      warn('be careful');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('[WARN] be careful');
    });

    it('is suppressed at ERROR level', () => {
      setLevel(LOG_LEVELS.ERROR);
      warn('be careful');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('prints at INFO level (INFO >= WARN)', () => {
      setLevel(LOG_LEVELS.INFO);
      warn('be careful');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('info', () => {
    it('prints at INFO level via console.log', () => {
      setLevel(LOG_LEVELS.INFO);
      info('starting up');
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain('[INFO] starting up');
    });

    it('is suppressed at WARN level', () => {
      setLevel(LOG_LEVELS.WARN);
      info('starting up');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('is suppressed at ERROR level', () => {
      setLevel(LOG_LEVELS.ERROR);
      info('starting up');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('success', () => {
    it('prints at INFO level via console.log with [OK] prefix', () => {
      setLevel(LOG_LEVELS.INFO);
      success('done');
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain('[OK] done');
    });

    it('is suppressed at WARN level', () => {
      setLevel(LOG_LEVELS.WARN);
      success('done');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('is suppressed at INFO level', () => {
      setLevel(LOG_LEVELS.INFO);
      debug('trace');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('prints the message line at DEBUG level', () => {
      setLevel(LOG_LEVELS.DEBUG);
      debug('trace message');
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain('[DEBUG');
      expect(logSpy.mock.calls[0][0]).toContain('trace message');
    });

    it('prints the JSON data line when data is provided at DEBUG level', () => {
      setLevel(LOG_LEVELS.DEBUG);
      const data = { foo: 'bar', count: 2 };
      debug('with data', data);
      expect(logSpy).toHaveBeenCalledTimes(2);
      expect(logSpy.mock.calls[1][0]).toContain(JSON.stringify(data, null, 2));
    });

    it('does not print a data line when data is null', () => {
      setLevel(LOG_LEVELS.DEBUG);
      debug('no data', null);
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('prints a data line when data is a falsy-but-not-null value', () => {
      setLevel(LOG_LEVELS.DEBUG);
      debug('falsy data', 0);
      // data !== null, so the JSON line is printed.
      expect(logSpy).toHaveBeenCalledTimes(2);
      expect(logSpy.mock.calls[1][0]).toContain('0');
    });
  });

  describe('step', () => {
    it('prints at INFO level via console.log with arrow prefix', () => {
      setLevel(LOG_LEVELS.INFO);
      step('installing dependencies');
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain('-> installing dependencies');
    });

    it('is suppressed at WARN level', () => {
      setLevel(LOG_LEVELS.WARN);
      step('installing dependencies');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('prints at DEBUG level', () => {
      setLevel(LOG_LEVELS.DEBUG);
      step('installing dependencies');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });
});
