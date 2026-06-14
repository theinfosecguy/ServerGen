import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { execFileSync, spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..', '..');

// Heavy, release-gated smoke test. It proves the PUBLISHED package works end to
// end: build the tarball with `npm pack`, install it into a throwaway project so
// `servergen` plus its runtime deps land in node_modules, then drive that
// INSTALLED CLI to scaffold real apps, install their deps, boot the servers, and
// assert a live HTTP response. This exercises exactly what a consumer gets from
// `npm install servergen`, not the repo working tree.

const PORTS = { express: 5310, node: 5311 };
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Sleep helper for retry backoff.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET http://127.0.0.1:<port>/ once and resolve { status, body }.
 */
const httpGet = (port) =>
  new Promise((resolve, reject) => {
    const req = http.get(
      { host: '127.0.0.1', port, path: '/', timeout: 2000 },
      (res) => {
        let body = '';
        res.setEncoding('utf-8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('timeout', () => req.destroy(new Error('request timeout')));
    req.on('error', reject);
  });

/**
 * Retry an HTTP GET with backoff until the server answers or we run out of time.
 */
const waitForHttp = async (port, deadlineMs = 10000) => {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < deadlineMs) {
    try {
      return await httpGet(port);
    } catch (err) {
      lastErr = err;
      await sleep(250);
    }
  }
  throw new Error(
    `server on port ${port} never responded within ${deadlineMs}ms: ${
      lastErr ? lastErr.message : 'unknown error'
    }`
  );
};

describe('published package smoke test', () => {
  let packDir; // holds the built tarball
  let installDir; // throwaway project where the tarball is installed
  let installedBin; // <installDir>/node_modules/servergen/bin/servergen.js
  const workDirs = []; // generation cwds, cleaned up in afterAll
  let child; // currently running server, killed in afterEach

  beforeAll(() => {
    packDir = fs.mkdtempSync(path.join(os.tmpdir(), 'servergen-smoke-pack-'));
    installDir = fs.mkdtempSync(path.join(os.tmpdir(), 'servergen-smoke-install-'));

    // Build the tarball from the project root into packDir.
    const packOutput = execFileSync(
      npmCmd,
      ['pack', '--pack-destination', packDir],
      { cwd: projectRoot, encoding: 'utf-8', timeout: 120000 }
    );

    // `npm pack` prints the tarball filename on its last non-empty line.
    const tarballName = packOutput
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .pop();
    const tarballPath = path.join(packDir, tarballName);
    expect(fs.existsSync(tarballPath)).toBe(true);

    // Stand up a throwaway project and install the tarball into it so that
    // servergen + its production deps resolve under node_modules, exactly like
    // a real consumer install.
    execFileSync(npmCmd, ['init', '-y'], {
      cwd: installDir,
      encoding: 'utf-8',
      timeout: 60000,
    });
    execFileSync(
      npmCmd,
      ['install', tarballPath, '--no-audit', '--no-fund'],
      { cwd: installDir, encoding: 'utf-8', timeout: 180000 }
    );

    installedBin = path.join(
      installDir,
      'node_modules',
      'servergen',
      'bin',
      'servergen.js'
    );
    expect(fs.existsSync(installedBin)).toBe(true);
  }, 240000);

  afterEach(() => {
    // Never leave a server running, regardless of how the test ended.
    if (child && !child.killed) {
      child.kill('SIGKILL');
    }
    child = undefined;
  });

  afterAll(() => {
    if (packDir) fs.removeSync(packDir);
    if (installDir) fs.removeSync(installDir);
    for (const dir of workDirs) {
      fs.removeSync(dir);
    }
  });

  /**
   * Generate an app with the INSTALLED CLI from a fresh temp cwd.
   * Returns the absolute path of the generated app directory.
   */
  const generate = (name, framework, port) => {
    const workDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'servergen-smoke-work-')
    );
    workDirs.push(workDir);
    execFileSync(
      'node',
      [installedBin, '-n', name, '-f', framework, '-p', String(port), '--skip-install'],
      { cwd: workDir, encoding: 'utf-8', timeout: 120000 }
    );
    return path.join(workDir, name);
  };

  /**
   * Boot `node index.js` in appDir with PORT set, returning the child process.
   */
  const startServer = (appDir, port) =>
    spawn('node', ['index.js'], {
      cwd: appDir,
      env: { ...process.env, PORT: String(port) },
      stdio: 'ignore',
    });

  it(
    'generates, builds, boots an Express app and serves HTTP 200',
    async () => {
      const port = PORTS.express;
      const appDir = generate('smokeexpress', 'express', port);

      // Required files exist.
      expect(fs.existsSync(path.join(appDir, 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'routes', 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'controllers'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'model'))).toBe(true);

      // A real .gitignore must ship (guards the gitignore fix this branch is on).
      const gitignorePath = path.join(appDir, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
      expect(fs.readFileSync(gitignorePath, 'utf-8').length).toBeGreaterThan(0);

      // Install the generated app's deps (express, cors, ...).
      execFileSync(npmCmd, ['install', '--no-audit', '--no-fund'], {
        cwd: appDir,
        encoding: 'utf-8',
        timeout: 180000,
      });

      // Boot the server and hit it over HTTP.
      child = startServer(appDir, port);
      try {
        const res = await waitForHttp(port);
        expect(res.status).toBe(200);
        expect(res.body).toContain('Welcome to ServerGen!');
      } finally {
        if (child && !child.killed) {
          child.kill('SIGKILL');
        }
        child = undefined;
      }
    },
    240000
  );

  it(
    'generates, builds, boots a Node app and serves HTTP 200',
    async () => {
      const port = PORTS.node;
      const appDir = generate('smokenode', 'node', port);

      // Required files exist.
      expect(fs.existsSync(path.join(appDir, 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'package.json'))).toBe(true);

      // A real .gitignore must ship.
      const gitignorePath = path.join(appDir, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
      expect(fs.readFileSync(gitignorePath, 'utf-8').length).toBeGreaterThan(0);

      // Install the generated app's deps (nodemon devDep, etc.).
      execFileSync(npmCmd, ['install', '--no-audit', '--no-fund'], {
        cwd: appDir,
        encoding: 'utf-8',
        timeout: 180000,
      });

      // Boot the server and hit it over HTTP.
      child = startServer(appDir, port);
      try {
        const res = await waitForHttp(port);
        expect(res.status).toBe(200);
        expect(res.body).toContain('Hello World');
      } finally {
        if (child && !child.killed) {
          child.kill('SIGKILL');
        }
        child = undefined;
      }
    },
    240000
  );
});
