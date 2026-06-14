import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..', '..');
let testOutput;

describe('CLI Integration', () => {
  beforeEach(() => {
    testOutput = fs.mkdtempSync(path.join(os.tmpdir(), 'servergen-integration-'));
  });

  afterEach(() => {
    fs.removeSync(testOutput);
  });

  const runCLI = (args) => {
    const cmd = `node ${path.join(projectRoot, 'bin', 'servergen.js')} ${args}`;
    return execSync(cmd, {
      cwd: testOutput,
      encoding: 'utf-8',
      timeout: 60000,
    });
  };

  describe('help command', () => {
    it('displays help information', () => {
      const output = runCLI('--help');
      expect(output).toContain('Usage:');
      expect(output).toContain('-n, --name');
      expect(output).toContain('-f, --framework');
    });

    it('displays version', () => {
      const output = runCLI('--version');
      expect(output).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('Express app generation', () => {
    it('generates Express app with correct structure', () => {
      runCLI('-n testapp -f express --skip-install');
      
      const appDir = path.join(testOutput, 'testapp');
      expect(fs.existsSync(appDir)).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'routes'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'controllers'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'model'))).toBe(true);
    });

    it('generates package.json with express dependency', () => {
      runCLI('-n expresstest -f express --skip-install');
      
      const pkgPath = path.join(testOutput, 'expresstest', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      expect(pkg.name).toBe('expresstest');
      expect(pkg.dependencies.express).toBeDefined();
      expect(pkg.devDependencies.nodemon).toBeDefined();
      expect(pkg.dependencies.cors).toBeDefined();
      expect(pkg.scripts.start).toBe('node index.js');
    });

    it('includes view engine when specified', () => {
      runCLI('-n viewtest -f express -v ejs --skip-install');
      
      const pkgPath = path.join(testOutput, 'viewtest', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      expect(pkg.dependencies.ejs).toBeDefined();
    });

    it('includes mongoose when --db flag used', () => {
      runCLI('-n dbtest -f express --db --skip-install');
      
      const pkgPath = path.join(testOutput, 'dbtest', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      expect(pkg.dependencies.mongoose).toBeDefined();
      expect(fs.existsSync(path.join(testOutput, 'dbtest', 'config'))).toBe(true);
    });
  });

  describe('Node app generation', () => {
    it('generates Node app with correct structure', () => {
      runCLI('-n nodetest -f node --skip-install');
      
      const appDir = path.join(testOutput, 'nodetest');
      expect(fs.existsSync(appDir)).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(appDir, 'package.json'))).toBe(true);
    });

    it('generates package.json without express dependency', () => {
      runCLI('-n purenode -f node --skip-install');
      
      const pkgPath = path.join(testOutput, 'purenode', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      expect(pkg.dependencies.express).toBeUndefined();
      expect(pkg.devDependencies.nodemon).toBeDefined();
    });
  });

  describe('support files', () => {
    it('includes .gitignore', () => {
      runCLI('-n gittest -f express --skip-install');
      expect(fs.existsSync(path.join(testOutput, 'gittest', '.gitignore'))).toBe(true);
    });

    it('includes Dockerfile', () => {
      runCLI('-n dockertest -f express --skip-install');
      expect(fs.existsSync(path.join(testOutput, 'dockertest', 'Dockerfile'))).toBe(true);
    });

    it('includes .dockerignore', () => {
      runCLI('-n dockertest2 -f express --skip-install');
      expect(fs.existsSync(path.join(testOutput, 'dockertest2', '.dockerignore'))).toBe(true);
    });
  });

  describe('custom port', () => {
    it('configures custom port in index.js', () => {
      runCLI('-n porttest -f express -p 8080 --skip-install');

      const indexPath = path.join(testOutput, 'porttest', 'index.js');
      const content = fs.readFileSync(indexPath, 'utf-8');

      expect(content).toContain('8080');
    });
  });

  describe('database combined with port and views', () => {
    it('keeps the custom port when --db is used', () => {
      runCLI('-n dbport -f express --db -p 8080 --skip-install');

      const content = fs.readFileSync(
        path.join(testOutput, 'dbport', 'index.js'),
        'utf-8'
      );
      expect(content).toContain('8080');
      expect(content).toContain("require('./config/mongoose')");
    });

    it('keeps the view engine when --db is used', () => {
      runCLI('-n dbview -f express --db -v ejs --skip-install');

      const content = fs.readFileSync(
        path.join(testOutput, 'dbview', 'index.js'),
        'utf-8'
      );
      expect(content).toContain('view engine');
      expect(content).toContain('ejs');
      expect(content).toContain("require('./config/mongoose')");
    });

    it('keeps both port and view when --db, --port and --view are combined', () => {
      runCLI('-n dball -f express --db -v ejs -p 8080 --skip-install');

      const content = fs.readFileSync(
        path.join(testOutput, 'dball', 'index.js'),
        'utf-8'
      );
      expect(content).toContain('8080');
      expect(content).toContain('ejs');
      expect(content).toContain("require('./config/mongoose')");
    });
  });

  describe('unsupported flag combinations', () => {
    it('rejects --view with the node framework', () => {
      expect(() => runCLI('-n nodeview -f node -v ejs --skip-install')).toThrow();
      expect(fs.existsSync(path.join(testOutput, 'nodeview'))).toBe(false);
    });

    it('does not create a views directory for node apps', () => {
      runCLI('-n nodenoview -f node --skip-install');
      expect(fs.existsSync(path.join(testOutput, 'nodenoview', 'views'))).toBe(false);
    });
  });
});
