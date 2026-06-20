import { describe, it, expect } from 'vitest';
import { cleanAppName } from '../../lib/fileName.js';

describe('cleanAppName', () => {
  it('converts to lowercase', () => {
    expect(cleanAppName('MyApp')).toBe('myapp');
  });

  it('preserves single hyphen separators', () => {
    expect(cleanAppName('demo-express')).toBe('demo-express');
  });

  it('normalizes uppercase hyphenated names', () => {
    expect(cleanAppName('My-Api')).toBe('my-api');
  });

  it('collapses spaces and unsafe punctuation into single hyphens', () => {
    expect(cleanAppName('my app_test!@#demo')).toBe('my-app-test-demo');
  });

  it('collapses repeated hyphens', () => {
    expect(cleanAppName('my---app')).toBe('my-app');
  });

  it('removes leading and trailing hyphens from unsafe input', () => {
    expect(cleanAppName('../My-App/')).toBe('my-app');
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
