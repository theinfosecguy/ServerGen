import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import * as buildHelper from '../../lib/build_helper.js';

let testDir;

describe('build_helper', () => {
  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'servergen-build-helper-'));
  });

  afterEach(() => {
    fs.removeSync(testDir);
  });

  describe('createDir', () => {
    it('creates a directory inside app directory', () => {
      buildHelper.createDir(testDir, 'controllers');
      const dirPath = path.join(testDir, 'controllers');
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('creates nested directory structure', () => {
      buildHelper.createDir(testDir, 'config');
      buildHelper.createDir(testDir, 'routes');
      expect(fs.existsSync(path.join(testDir, 'config'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'routes'))).toBe(true);
    });
  });

  describe('buildFilewithContents', () => {
    it('copies file content to destination', () => {
      const sourceFile = path.join(testDir, 'source.txt');
      fs.writeFileSync(sourceFile, 'test content');

      buildHelper.buildFilewithContents(sourceFile, testDir, 'dest.txt');

      const destContent = fs.readFileSync(path.join(testDir, 'dest.txt'), 'utf-8');
      expect(destContent).toBe('test content');
    });
  });

  describe('buildFolderforApp', () => {
    it('creates a new folder', () => {
      const newFolder = path.join(testDir, 'new-app');
      buildHelper.buildFolderforApp(newFolder);
      expect(fs.existsSync(newFolder)).toBe(true);
    });

    it('throws if folder already exists', () => {
      const existingFolder = path.join(testDir, 'existing');
      fs.mkdirSync(existingFolder);

      expect(() => {
        buildHelper.buildFolderforApp(existingFolder);
      }).toThrow(/already exists/);
    });
  });
});
