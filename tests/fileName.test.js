import { describe, it, expect } from 'vitest';
import { cleanAppName } from '../lib/fileName.js';

describe('cleanAppName', () => {
  it('converts to lowercase', () => {
    expect(cleanAppName('MyApp')).toBe('myapp');
  });

  it('removes spaces', () => {
    expect(cleanAppName('my app')).toBe('myapp');
  });

  it('removes special characters', () => {
    expect(cleanAppName('my-app_test!@#')).toBe('myapptest');
  });

  it('removes hyphens and underscores', () => {
    expect(cleanAppName('my-app_name')).toBe('myappname');
  });

  it('handles numbers', () => {
    expect(cleanAppName('app123')).toBe('app123');
  });

  it('handles empty string', () => {
    expect(cleanAppName('')).toBe('');
  });

  it('handles only special characters', () => {
    expect(cleanAppName('---___!!!')).toBe('');
  });
});
