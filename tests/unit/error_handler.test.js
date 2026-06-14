import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handleError, withErrorHandling } from '../../lib/error_handler.js';

describe('error_handler', () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleError', () => {
    it('prints the error message when no context is provided', () => {
      handleError(new Error('something broke'));
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Error: something broke');
    });

    it('prints "context: message" when context is provided', () => {
      handleError(new Error('disk full'), 'Writing file');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Writing file: disk full');
    });

    it('does not include a context prefix when context is an empty string', () => {
      handleError(new Error('plain message'), '');
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Error: plain message');
      expect(output).not.toContain('plain message: plain message');
    });

    it('treats a missing context argument like the default empty context', () => {
      handleError(new Error('no context'));
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Error: no context');
      expect(output).not.toContain(': no context: ');
    });

    it('prepends "Error:" to the formatted message', () => {
      handleError(new Error('boom'), 'Build step');
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Error: Build step: boom');
    });

    it('handles an error with an empty message', () => {
      handleError(new Error(''));
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Error:');
    });

    it('includes the context even when the error message is empty', () => {
      handleError(new Error(''), 'Some context');
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Some context:');
    });
  });

  describe('withErrorHandling', () => {
    it('returns a function', () => {
      const wrapped = withErrorHandling(async () => 'ok');
      expect(typeof wrapped).toBe('function');
    });

    it('resolves to the wrapped function return value on success', async () => {
      const wrapped = withErrorHandling(async () => 'result');
      await expect(wrapped()).resolves.toBe('result');
    });

    it('does not call handleError on success', async () => {
      const wrapped = withErrorHandling(async () => 42);
      const result = await wrapped();
      expect(result).toBe(42);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('passes arguments through to the wrapped function', async () => {
      const fn = vi.fn(async (a, b) => a + b);
      const wrapped = withErrorHandling(fn);
      const result = await wrapped(2, 3);
      expect(result).toBe(5);
      expect(fn).toHaveBeenCalledWith(2, 3);
    });

    it('awaits and resolves a promise-returning function value', async () => {
      const wrapped = withErrorHandling(async () => Promise.resolve('async value'));
      await expect(wrapped()).resolves.toBe('async value');
    });

    it('re-throws the same error when the wrapped function throws', async () => {
      const err = new Error('failure');
      const wrapped = withErrorHandling(async () => {
        throw err;
      });
      await expect(wrapped()).rejects.toBe(err);
    });

    it('calls handleError when the wrapped function throws', async () => {
      const err = new Error('boom');
      const wrapped = withErrorHandling(async () => {
        throw err;
      });
      await expect(wrapped()).rejects.toThrow('boom');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('Error: boom');
    });

    it('re-throws errors from a synchronously-throwing wrapped function', async () => {
      const err = new Error('sync throw');
      const wrapped = withErrorHandling(() => {
        throw err;
      });
      await expect(wrapped()).rejects.toBe(err);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('rejects when the wrapped function returns a rejected promise', async () => {
      const err = new Error('rejected');
      const wrapped = withErrorHandling(() => Promise.reject(err));
      await expect(wrapped()).rejects.toBe(err);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
