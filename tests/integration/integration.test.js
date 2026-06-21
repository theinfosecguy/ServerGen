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

  const expectCLIError = (args, messageSubstring) => {
    let caught;
    try {
      runCLI(args);
    } catch (e) {
      caught = e;
    }
    expect(caught, `expected the CLI to fail for: ${args}`).toBeDefined();
    const output = `${caught.stdout || ''}${caught.stderr || ''}`;
    if (messageSubstring) {
      expect(output).toContain(messageSubstring);
    }
    return caught;
  };

  describe('help command', () => {
    it('displays help information', () => {
      const output = runCLI('--help');
      expect(output).toContain('Usage:');
      expect(output).toContain('-n, --name');
      expect(output).toContain('-f, --framework');
    });

    it('shows usage examples', () => {
      const output = runCLI('--help');
      expect(output).toContain('Examples:');
      expect(output).toContain('servergen my-api');
      expect(output).toContain('-f node');
      expect(output).toContain('--db');
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

    it('renders the selected view from the root route', () => {
      runCLI('-n rendertest -f express -v ejs --skip-install');

      const routes = fs.readFileSync(
        path.join(testOutput, 'rendertest', 'routes', 'index.js'),
        'utf-8'
      );

      expect(routes).toContain("res.status(200).render('ve_ejs'");
      expect(routes).toContain("message: 'Welcome to ServerGen!'");
    });

    it('generates JSON routes with status before body serialization', () => {
      runCLI('-n routeorder -f express --skip-install');

      const routes = fs.readFileSync(
        path.join(testOutput, 'routeorder', 'routes', 'index.js'),
        'utf-8'
      );

      expect(routes).toMatch(
        /router\.get\('\/', function \(req, res\) \{\n  res\n    \.status\(200\)\n    \.json\({/
      );
      expect(routes).toMatch(
        /router\.post\('\/', function \(req, res\) \{\n  res\n    \.status\(200\)\n    \.json\({/
      );
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

    it('generates package.json without express or cors dependencies', () => {
      runCLI('-n purenode -f node --skip-install');
      
      const pkgPath = path.join(testOutput, 'purenode', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      expect(pkg.dependencies.express).toBeUndefined();
      expect(pkg.dependencies.cors).toBeUndefined();
      expect(pkg.devDependencies.nodemon).toBeDefined();
      expect(pkg.engines.node).toBe('>=20');
    });

    it('generates a JSON-first Node server template', () => {
      runCLI('-n nodejson -f node --skip-install');

      const index = fs.readFileSync(
        path.join(testOutput, 'nodejson', 'index.js'),
        'utf-8'
      );

      expect(index).toContain("Content-Type', 'application/json; charset=utf-8'");
      expect(index).toContain("process.env.HOST || '0.0.0.0'");
      expect(index).toContain("requestPath === '/'");
      expect(index).toContain("message: 'Welcome to ServerGen!'");
      expect(index).toContain("message: 'About this ServerGen app'");
      expect(index).toContain("message: 'Contact this ServerGen app'");
      expect(index).toContain("status: 'ok'");
      expect(index).toContain("sendJson(404, { error: 'Not Found' })");
      expect(index).not.toContain('Make-Server');
      expect(index).not.toContain('<h1>');
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

    it('configures custom port in generated support docs', () => {
      runCLI('-n portdocs -f express -p 8080 --skip-install');

      const appDir = path.join(testOutput, 'portdocs');
      const env = fs.readFileSync(path.join(appDir, '.env.example'), 'utf-8');
      const readme = fs.readFileSync(path.join(appDir, 'README.md'), 'utf-8');
      const dockerfile = fs.readFileSync(path.join(appDir, 'Dockerfile'), 'utf-8');

      expect(env).toContain('PORT=8080');
      expect(readme).toContain('http://localhost:8080');
      expect(readme).toContain('# portdocs');
      expect(readme).not.toContain('# Project Name');
      expect(dockerfile).toContain('EXPOSE 8080');
      expect(dockerfile).not.toContain('EXPOSE 3000');
    });

    it('configures custom port in Node generated support docs', () => {
      runCLI('-n nodeportdocs -f node -p 8081 --skip-install');

      const appDir = path.join(testOutput, 'nodeportdocs');
      const readme = fs.readFileSync(path.join(appDir, 'README.md'), 'utf-8');
      const dockerfile = fs.readFileSync(path.join(appDir, 'Dockerfile'), 'utf-8');

      expect(readme).toContain('http://127.0.0.1:8081');
      expect(readme).toContain('# nodeportdocs');
      expect(readme).not.toContain('http://127.0.0.1:3000');
      expect(readme).not.toContain('# Project Name');
      expect(dockerfile).toContain('EXPOSE 8081');
      expect(dockerfile).not.toContain('EXPOSE 3000');
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

  describe('app name resolution', () => {
    it('accepts a positional app name', () => {
      runCLI('posapp --skip-install');
      expect(fs.existsSync(path.join(testOutput, 'posapp', 'index.js'))).toBe(true);
    });

    it('accepts the legacy --name flag', () => {
      runCLI('--name legacyapp --skip-install');
      expect(fs.existsSync(path.join(testOutput, 'legacyapp', 'index.js'))).toBe(true);
    });

    it('sanitizes the positional name', () => {
      runCLI('My-Api --skip-install');
      const appDir = path.join(testOutput, 'my-api');
      expect(fs.existsSync(path.join(appDir, 'index.js'))).toBe(true);

      const pkg = JSON.parse(fs.readFileSync(path.join(appDir, 'package.json'), 'utf-8'));
      expect(pkg.name).toBe('my-api');
    });

    it('keeps path-like names inside the current working directory', () => {
      const outsideName = `escape-${path.basename(testOutput)}`;
      const appName = outsideName.toLowerCase();
      runCLI(`../${outsideName} --skip-install`);

      expect(fs.existsSync(path.join(testOutput, appName, 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(path.dirname(testOutput), outsideName))).toBe(false);
      expect(fs.existsSync(path.join(path.dirname(testOutput), appName))).toBe(false);
    });

    it('accepts the same name supplied both ways', () => {
      runCLI('sameapp --name sameapp --skip-install');
      expect(fs.existsSync(path.join(testOutput, 'sameapp', 'index.js'))).toBe(true);
    });

    it('rejects conflicting positional and --name values', () => {
      expectCLIError('appone --name apptwo --skip-install', 'Conflicting app names');
      expect(fs.existsSync(path.join(testOutput, 'appone'))).toBe(false);
      expect(fs.existsSync(path.join(testOutput, 'apptwo'))).toBe(false);
    });

    it('errors when no name is provided', () => {
      expectCLIError('--skip-install', 'Missing app name');
    });

    it('errors when the name has no alphanumeric characters', () => {
      expectCLIError('@@@ --skip-install', 'at least one alphanumeric');
    });
  });

  describe('defaults', () => {
    it('defaults the framework to express and the port to 3000', () => {
      runCLI('defaultapp --skip-install');

      const pkg = JSON.parse(
        fs.readFileSync(
          path.join(testOutput, 'defaultapp', 'package.json'),
          'utf-8'
        )
      );
      expect(pkg.dependencies.express).toBeDefined();

      const index = fs.readFileSync(
        path.join(testOutput, 'defaultapp', 'index.js'),
        'utf-8'
      );
      expect(index).toContain('process.env.PORT || 3000');
    });
  });

  describe('supported flags', () => {
    it('supports the pug view engine', () => {
      runCLI('pugapp -v pug --skip-install');
      const pkg = JSON.parse(
        fs.readFileSync(path.join(testOutput, 'pugapp', 'package.json'), 'utf-8')
      );
      expect(pkg.dependencies.pug).toBeDefined();
    });

    it('supports the hbs view engine', () => {
      runCLI('hbsapp -v hbs --skip-install');
      const pkg = JSON.parse(
        fs.readFileSync(path.join(testOutput, 'hbsapp', 'package.json'), 'utf-8')
      );
      expect(pkg.dependencies.hbs).toBeDefined();
    });

    it('--skip-install does not install dependencies', () => {
      runCLI('skipapp --skip-install');
      expect(
        fs.existsSync(path.join(testOutput, 'skipapp', 'node_modules'))
      ).toBe(false);
    });

    it('--debug emits debug logging', () => {
      const output = runCLI('debugapp --debug --skip-install');
      expect(output).toContain('[DEBUG');
    });
  });

  describe('invalid options', () => {
    it('rejects --db with the node framework', () => {
      expectCLIError(
        'nodedb -f node --db --skip-install',
        'only supported with the express framework'
      );
      expect(fs.existsSync(path.join(testOutput, 'nodedb'))).toBe(false);
    });

    it('rejects an invalid framework', () => {
      expectCLIError('badfw -f flask --skip-install', 'Invalid framework');
    });

    it('rejects an invalid view engine', () => {
      expectCLIError('badview -v jade --skip-install', 'Invalid view engine');
    });

    it('rejects an out-of-range port', () => {
      expectCLIError('badport -p 99999 --skip-install', 'Invalid port');
    });

    it('rejects a port of zero', () => {
      expectCLIError('zeroport -p 0 --skip-install', 'Invalid port');
    });
  });

  describe('production-ready Express app', () => {
    const generateExpress = (name, extra = '') => {
      runCLI(`${name} -f express ${extra} --skip-install`.replace(/\s+/g, ' ').trim());
      return path.join(testOutput, name);
    };

    it('includes a /health endpoint', () => {
      const index = fs.readFileSync(
        path.join(generateExpress('healthapp'), 'index.js'),
        'utf-8'
      );
      expect(index).toContain("app.get('/health'");
      expect(index).toContain("status: 'ok'");
    });

    it('loads dotenv and exports the app for testing', () => {
      const index = fs.readFileSync(
        path.join(generateExpress('dotenvapp'), 'index.js'),
        'utf-8'
      );
      expect(index).toContain("require('dotenv').config({ quiet: true })");
      expect(index).toContain('module.exports = app');
      expect(index).toContain('require.main === module');
    });

    it('binds to 0.0.0.0 and handles SIGINT/SIGTERM', () => {
      const index = fs.readFileSync(
        path.join(generateExpress('shutapp'), 'index.js'),
        'utf-8'
      );
      expect(index).toContain("'0.0.0.0'");
      expect(index).toContain("process.on('SIGINT'");
      expect(index).toContain("process.on('SIGTERM'");
      expect(index).toContain('server.close');
    });

    it('registers centralized error-handling middleware', () => {
      const index = fs.readFileSync(
        path.join(generateExpress('errapp'), 'index.js'),
        'utf-8'
      );
      expect(index).toContain('Internal Server Error');
    });

    it('adds dotenv, start/dev/test scripts and supertest', () => {
      const pkg = JSON.parse(
        fs.readFileSync(
          path.join(generateExpress('scriptsapp'), 'package.json'),
          'utf-8'
        )
      );
      expect(pkg.dependencies.dotenv).toBeDefined();
      expect(pkg.scripts.start).toBe('node index.js');
      expect(pkg.scripts.dev).toBe('nodemon index.js');
      expect(pkg.scripts.test).toBe('node --test');
      expect(pkg.devDependencies.supertest).toBeDefined();
      expect(pkg.engines.node).toBe('>=20');
    });

    it('generates a basic integration test', () => {
      const testFile = path.join(
        generateExpress('testedapp'),
        'test',
        'app.test.js'
      );
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toContain('/health');
    });

    it('uses MONGODB_URI in the mongoose config with --db', () => {
      const mongoose = fs.readFileSync(
        path.join(generateExpress('dbenvapp', '--db'), 'config', 'mongoose.js'),
        'utf-8'
      );
      expect(mongoose).toContain('process.env.MONGODB_URI');
      expect(mongoose).toContain("require('dotenv').config({ quiet: true })");
    });

    it('exports a lazy MongoDB connector instead of connecting on import', () => {
      const mongoose = fs.readFileSync(
        path.join(generateExpress('lazydbapp', '--db'), 'config', 'mongoose.js'),
        'utf-8'
      );

      expect(mongoose).toContain('const connectDatabase = function ()');
      expect(mongoose).toContain('module.exports = { mongoose, connectDatabase }');
      expect(mongoose.indexOf('.connect(uri)')).toBeGreaterThan(
        mongoose.indexOf('const connectDatabase')
      );
    });

    it('calls connectDatabase only from the generated server startup path', () => {
      const index = fs.readFileSync(
        path.join(generateExpress('dbstartapp', '--db'), 'index.js'),
        'utf-8'
      );

      expect(index).toContain(
        "const { mongoose, connectDatabase } = require('./config/mongoose')"
      );
      expect(index.indexOf('connectDatabase();')).toBeGreaterThan(
        index.indexOf('if (require.main === module)')
      );
    });

    it('only includes MONGODB_URI in .env.example when --db is used', () => {
      const plainEnv = fs.readFileSync(
        path.join(generateExpress('plainenvapp'), '.env.example'),
        'utf-8'
      );
      const dbEnv = fs.readFileSync(
        path.join(generateExpress('dbexampleapp', '--db'), '.env.example'),
        'utf-8'
      );

      expect(plainEnv).not.toContain('MONGODB_URI');
      expect(dbEnv).toContain('MONGODB_URI');
    });

    it('does not add the express test scaffolding to node apps', () => {
      runCLI('nodeplain -f node --skip-install');
      const pkg = JSON.parse(
        fs.readFileSync(
          path.join(testOutput, 'nodeplain', 'package.json'),
          'utf-8'
        )
      );
      expect(pkg.scripts.test).toBeUndefined();
      expect(pkg.dependencies.dotenv).toBeUndefined();
      expect(fs.existsSync(path.join(testOutput, 'nodeplain', 'test'))).toBe(false);
    });
  });
});
