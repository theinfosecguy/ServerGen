/**
 * Interactive CLI prompts for ServerGen.
 * @module lib/interactive
 */

import { createInterface } from 'node:readline/promises';

const trimLower = (value) => value.trim().toLowerCase();

const writeValidationMessage = (output, message) => {
  if (output?.write) {
    output.write(`${message}\n`);
  }
};

const askRequired = async ({ question, output, prompt, errorMessage }) => {
  while (true) {
    const answer = (await question(prompt)).trim();
    if (answer) {
      return answer;
    }
    writeValidationMessage(output, errorMessage);
  }
};

const askChoice = async ({
  question,
  output,
  prompt,
  choices,
  defaultValue,
  errorMessage,
}) => {
  while (true) {
    const answer = trimLower(await question(prompt));
    if (!answer) {
      return defaultValue;
    }
    if (Object.prototype.hasOwnProperty.call(choices, answer)) {
      return choices[answer];
    }
    writeValidationMessage(output, errorMessage);
  }
};

const askPort = async ({ question, output, defaultPort }) => {
  while (true) {
    const answer = trimLower(await question(`Port [${defaultPort}]: `));
    const port = answer ? Number(answer) : defaultPort;
    if (Number.isInteger(port) && port >= 1 && port <= 65535) {
      return port;
    }
    writeValidationMessage(output, 'Please enter a port between 1 and 65535.');
  }
};

/**
 * Returns whether stdin/stdout can support an interactive prompt.
 * @param {Object} input - Input stream.
 * @param {Object} output - Output stream.
 * @returns {boolean} Whether the terminal is interactive.
 */
export const isInteractiveTerminal = (input, output) => {
  return Boolean(input?.isTTY && output?.isTTY);
};

/**
 * Prompts for the interactive ServerGen options using an injected question
 * function so tests can provide scripted answers without a real TTY.
 * @param {Object} deps - Prompt dependencies.
 * @param {Function} deps.question - Async prompt function.
 * @param {Object} [deps.output] - Output stream for validation messages.
 * @param {Object} [deps.defaults] - Prompt defaults.
 * @returns {Promise<Object>} Normalized generation options.
 */
export const promptForInteractiveOptions = async ({
  question,
  output,
  defaults = {},
}) => {
  const defaultPort = Number(defaults.port) || 3000;

  const name = await askRequired({
    question,
    output,
    prompt: 'Project name: ',
    errorMessage: 'Project name is required.',
  });

  const typescript = await askChoice({
    question,
    output,
    prompt: 'Language (TypeScript/JavaScript) [TypeScript]: ',
    choices: {
      ts: true,
      typescript: true,
      js: false,
      javascript: false,
    },
    defaultValue: true,
    errorMessage: 'Please choose TypeScript or JavaScript.',
  });

  const openapi = await askChoice({
    question,
    output,
    prompt: 'OpenAPI spec? (Y/n): ',
    choices: {
      y: true,
      yes: true,
      n: false,
      no: false,
    },
    defaultValue: true,
    errorMessage: 'Please answer yes or no.',
  });

  const db = await askChoice({
    question,
    output,
    prompt: 'Database (none/mongodb) [none]: ',
    choices: {
      none: false,
      no: false,
      n: false,
      mongo: true,
      mongodb: true,
      mongoose: true,
    },
    defaultValue: false,
    errorMessage: 'Please choose none or mongodb.',
  });

  const view = await askChoice({
    question,
    output,
    prompt: 'View engine (none/ejs/pug/hbs) [none]: ',
    choices: {
      none: undefined,
      no: undefined,
      n: undefined,
      ejs: 'ejs',
      pug: 'pug',
      hbs: 'hbs',
    },
    defaultValue: undefined,
    errorMessage: 'Please choose none, ejs, pug, or hbs.',
  });

  const port = await askPort({ question, output, defaultPort });

  const installDependencies = await askChoice({
    question,
    output,
    prompt: 'Install dependencies? (Y/n): ',
    choices: {
      y: true,
      yes: true,
      n: false,
      no: false,
    },
    defaultValue: true,
    errorMessage: 'Please answer yes or no.',
  });

  return {
    name,
    typescript,
    openapi,
    db,
    view,
    port,
    skipInstall: !installDependencies,
  };
};

/**
 * Runs the interactive wizard with Node's built-in readline/promises.
 * @param {Object} deps - Prompt dependencies.
 * @param {Object} deps.input - Input stream.
 * @param {Object} deps.output - Output stream.
 * @param {Object} [deps.defaults] - Prompt defaults.
 * @returns {Promise<Object>} Normalized generation options.
 */
export const runInteractiveWizard = async ({ input, output, defaults }) => {
  const readline = createInterface({ input, output });
  try {
    return await promptForInteractiveOptions({
      question: (prompt) => readline.question(prompt),
      output,
      defaults,
    });
  } finally {
    readline.close();
  }
};
