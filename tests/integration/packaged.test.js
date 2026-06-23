import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..', '..');

// These tests guard against npm stripping files named '.gitignore' from the
// published tarball. They build the real tarball with `npm pack`, extract it,
// and run the EXTRACTED bin so we exercise exactly what consumers install,
// not the repo working tree.
describe('packaged CLI (from npm tarball)', () => {
  let packDir; // holds the tarball + extracted package/
  let workDir; // cwd for generation, isolated from the package
  let extractedBin;

  beforeAll(() => {
    packDir = fs.mkdtempSync(path.join(os.tmpdir(), 'servergen-pack-'));
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'servergen-work-'));

    // Build the tarball into packDir.
    const packOutput = execSync(`npm pack --pack-destination "${packDir}"`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 120000,
    });

    // `npm pack` prints the tarball filename on its last non-empty line.
    const tarballName = packOutput
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .pop();
    const tarballPath = path.join(packDir, tarballName);
    expect(fs.existsSync(tarballPath)).toBe(true);

    // npm tarballs extract into a top-level "package/" directory.
    execSync(`tar -xzf "${tarballPath}" -C "${packDir}"`, {
      encoding: 'utf-8',
      timeout: 120000,
    });

    const extractedPkgDir = path.join(packDir, 'package');
    extractedBin = path.join(extractedPkgDir, 'bin', 'servergen.js');
    expect(fs.existsSync(extractedBin)).toBe(true);

    // The extracted tarball has no node_modules, so install the production
    // dependencies (commander, etc.) the bin needs at runtime.
    execSync('npm install --omit=dev --no-audit --no-fund', {
      cwd: extractedPkgDir,
      encoding: 'utf-8',
      timeout: 120000,
    });
  }, 180000);

  afterAll(() => {
    if (packDir) fs.removeSync(packDir);
    if (workDir) fs.removeSync(workDir);
  });

  const generateFromTarball = (name, framework, extraArgs = '') => {
    execSync(
      `node "${extractedBin}" -n ${name} -f ${framework} ${extraArgs} --skip-install`,
      {
        cwd: workDir,
        encoding: 'utf-8',
        timeout: 120000,
      }
    );
    return path.join(workDir, name);
  };

  it('ships a real .gitignore in a generated express app', () => {
    const appDir = generateFromTarball('packtest', 'express');

    const gitignorePath = path.join(appDir, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const contents = fs.readFileSync(gitignorePath, 'utf-8');
    expect(contents.length).toBeGreaterThan(0);
    expect(contents).toContain('node_modules');
  }, 120000);

  it('generates OpenAPI docs from the packaged CLI', () => {
    const appDir = generateFromTarball('pack-openapi', 'express', '--openapi -p 8080');
    const specPath = path.join(appDir, 'docs', 'openapi.yaml');
    const spec = fs.readFileSync(specPath, 'utf-8');

    expect(fs.existsSync(specPath)).toBe(true);
    expect(spec).toContain("title: 'pack-openapi API'");
    expect(spec).toContain('url: http://localhost:8080');
  }, 120000);

  it('ships a real .gitignore in a generated node app', () => {
    const appDir = generateFromTarball('pack-test-node', 'node');

    const gitignorePath = path.join(appDir, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const contents = fs.readFileSync(gitignorePath, 'utf-8');
    expect(contents.length).toBeGreaterThan(0);
    expect(contents).toContain('node_modules');
  }, 120000);
});
