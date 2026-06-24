#!/usr/bin/env node

import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const servergenBin = require.resolve('servergen/bin/servergen.js');

const child = spawn(process.execPath, [servergenBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

child.on('error', (err) => {
  console.error(`Failed to start servergen: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
