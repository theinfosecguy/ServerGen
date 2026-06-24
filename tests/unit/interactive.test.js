import { describe, it, expect } from 'vitest';
import {
  isInteractiveTerminal,
  promptForInteractiveOptions,
} from '../../lib/interactive.js';

const createPromptHarness = (answers) => {
  const prompts = [];
  const messages = [];
  return {
    prompts,
    output: {
      write(message) {
        messages.push(message);
      },
    },
    messages,
    question: async (prompt) => {
      prompts.push(prompt);
      if (answers.length === 0) {
        throw new Error(`No scripted answer for prompt: ${prompt}`);
      }
      return answers.shift();
    },
  };
};

describe('interactive prompts', () => {
  it('uses wizard defaults for empty optional answers', async () => {
    const harness = createPromptHarness([
      'My API',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);

    const result = await promptForInteractiveOptions(harness);

    expect(result).toEqual({
      name: 'My API',
      typescript: true,
      openapi: true,
      db: false,
      view: undefined,
      port: 3000,
      skipInstall: false,
    });
    expect(harness.prompts).toEqual([
      'Project name: ',
      'Language (TypeScript/JavaScript) [TypeScript]: ',
      'OpenAPI spec? (Y/n): ',
      'Database (none/mongodb) [none]: ',
      'View engine (none/ejs/pug/hbs) [none]: ',
      'Port [3000]: ',
      'Install dependencies? (Y/n): ',
    ]);
  });

  it('maps explicit answers to generator options', async () => {
    const harness = createPromptHarness([
      'api',
      'javascript',
      'no',
      'mongoose',
      'pug',
      '8080',
      'n',
    ]);

    const result = await promptForInteractiveOptions(harness);

    expect(result).toEqual({
      name: 'api',
      typescript: false,
      openapi: false,
      db: true,
      view: 'pug',
      port: 8080,
      skipInstall: true,
    });
  });

  it('retries invalid choices and keeps prompting until valid', async () => {
    const harness = createPromptHarness([
      '',
      'api',
      'ruby',
      'ts',
      'maybe',
      'y',
      'postgres',
      'mongodb',
      'jade',
      'hbs',
      'abc',
      '65536',
      '3001',
      'sure',
      'yes',
    ]);

    const result = await promptForInteractiveOptions(harness);

    expect(result).toMatchObject({
      name: 'api',
      typescript: true,
      openapi: true,
      db: true,
      view: 'hbs',
      port: 3001,
      skipInstall: false,
    });
    expect(harness.messages.join('')).toContain('Project name is required.');
    expect(harness.messages.join('')).toContain('Please choose TypeScript or JavaScript.');
    expect(harness.messages.join('')).toContain('Please answer yes or no.');
    expect(harness.messages.join('')).toContain('Please choose none or mongodb.');
    expect(harness.messages.join('')).toContain('Please choose none, ejs, pug, or hbs.');
    expect(harness.messages.join('')).toContain('Please enter a port between 1 and 65535.');
  });

  it('allows custom default ports', async () => {
    const harness = createPromptHarness(['api', '', '', '', '', '', '']);

    const result = await promptForInteractiveOptions({
      ...harness,
      defaults: { port: '8088' },
    });

    expect(result.port).toBe(8088);
    expect(harness.prompts).toContain('Port [8088]: ');
  });
});

describe('isInteractiveTerminal', () => {
  it('requires both input and output TTY streams', () => {
    expect(isInteractiveTerminal({ isTTY: true }, { isTTY: true })).toBe(true);
    expect(isInteractiveTerminal({ isTTY: false }, { isTTY: true })).toBe(false);
    expect(isInteractiveTerminal({ isTTY: true }, { isTTY: false })).toBe(false);
  });
});
