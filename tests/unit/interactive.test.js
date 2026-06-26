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
      '',
    ]);

    const result = await promptForInteractiveOptions(harness);

    expect(result).toEqual({
      name: 'My API',
      framework: 'express',
      typescript: true,
      openapi: true,
      db: false,
      view: undefined,
      port: 3000,
      skipInstall: false,
    });
    expect(harness.prompts).toEqual([
      'Project name: ',
      'Framework (express/node/hono) [express]: ',
      'Language (TypeScript/JavaScript) [TypeScript]: ',
      'OpenAPI spec? (Y/n): ',
      'Database (none/mongodb/postgres) [none]: ',
      'View engine (none/ejs/pug/hbs) [none]: ',
      'Port [3000]: ',
      'Install dependencies? (Y/n): ',
    ]);
  });

  it('maps explicit answers to generator options', async () => {
    const harness = createPromptHarness([
      'api',
      'express',
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
      framework: 'express',
      typescript: false,
      openapi: false,
      db: 'mongodb',
      view: 'pug',
      port: 8080,
      skipInstall: true,
    });
  });

  it('retries invalid choices and keeps prompting until valid', async () => {
    const harness = createPromptHarness([
      '',
      'api',
      'rails',
      'express',
      'ruby',
      'ts',
      'maybe',
      'y',
      'mysql',
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
      framework: 'express',
      typescript: true,
      openapi: true,
      db: 'mongodb',
      view: 'hbs',
      port: 3001,
      skipInstall: false,
    });
    expect(harness.messages.join('')).toContain('Project name is required.');
    expect(harness.messages.join('')).toContain('Please choose express, node, or hono.');
    expect(harness.messages.join('')).toContain('Please choose TypeScript or JavaScript.');
    expect(harness.messages.join('')).toContain('Please answer yes or no.');
    expect(harness.messages.join('')).toContain('Please choose none, mongodb, or postgres.');
    expect(harness.messages.join('')).toContain('Please choose none, ejs, pug, or hbs.');
    expect(harness.messages.join('')).toContain('Please enter a port between 1 and 65535.');
  });

  it('allows custom default ports', async () => {
    const harness = createPromptHarness(['api', '', '', '', '', '', '', '']);

    const result = await promptForInteractiveOptions({
      ...harness,
      defaults: { port: '8088' },
    });

    expect(result.port).toBe(8088);
    expect(harness.prompts).toContain('Port [8088]: ');
  });

  it('supports Postgres and Prisma for TypeScript Express apps', async () => {
    const harness = createPromptHarness([
      'api',
      'express',
      'typescript',
      'y',
      'postgres',
      '',
      '',
      'n',
    ]);

    const result = await promptForInteractiveOptions(harness);

    expect(result).toEqual({
      name: 'api',
      framework: 'express',
      typescript: true,
      openapi: true,
      db: 'postgres',
      orm: 'prisma',
      view: undefined,
      port: 3000,
      skipInstall: true,
    });
    expect(harness.prompts).toContain('ORM (prisma) [prisma]: ');
    expect(harness.prompts).not.toContain('View engine (none/ejs/pug/hbs) [none]: ');
  });

  it('uses implicit TypeScript and skips Express-only prompts for Hono', async () => {
    const harness = createPromptHarness(['api', 'hono', 'y', '8787', 'n']);

    const result = await promptForInteractiveOptions(harness);

    expect(result).toEqual({
      name: 'api',
      framework: 'hono',
      typescript: true,
      openapi: true,
      db: false,
      view: undefined,
      port: 8787,
      skipInstall: true,
    });
    expect(harness.prompts).toEqual([
      'Project name: ',
      'Framework (express/node/hono) [express]: ',
      'OpenAPI spec? (Y/n): ',
      'Port [3000]: ',
      'Install dependencies? (Y/n): ',
    ]);
  });

  it('skips TypeScript and Express-only prompts for Node', async () => {
    const harness = createPromptHarness(['api', 'node', '8081', 'n']);

    const result = await promptForInteractiveOptions(harness);

    expect(result).toEqual({
      name: 'api',
      framework: 'node',
      typescript: false,
      openapi: false,
      db: false,
      view: undefined,
      port: 8081,
      skipInstall: true,
    });
    expect(harness.prompts).toEqual([
      'Project name: ',
      'Framework (express/node/hono) [express]: ',
      'Port [3000]: ',
      'Install dependencies? (Y/n): ',
    ]);
  });
});

describe('isInteractiveTerminal', () => {
  it('requires both input and output TTY streams', () => {
    expect(isInteractiveTerminal({ isTTY: true }, { isTTY: true })).toBe(true);
    expect(isInteractiveTerminal({ isTTY: false }, { isTTY: true })).toBe(false);
    expect(isInteractiveTerminal({ isTTY: true }, { isTTY: false })).toBe(false);
  });
});
