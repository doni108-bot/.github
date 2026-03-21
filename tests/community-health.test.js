'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/**
 * Tests for community health files.
 * These files are required by GitHub to define community standards and policies.
 */

describe('Community Health Files', () => {
  describe('README.md', () => {
    const filePath = path.join(ROOT, 'README.md');

    test('file exists', () => {
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('file is not empty', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    test('contains a heading', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/^#\s+/m);
    });
  });

  describe('CONTRIBUTING.md', () => {
    const filePath = path.join(ROOT, 'CONTRIBUTING.md');

    test('file exists', () => {
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('file is not empty', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    test('contains a Contributing heading or section', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/contributing/i);
    });

    test('contains pull request submission instructions', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/pull request/i);
    });
  });

  describe('CODE_OF_CONDUCT.md', () => {
    const filePath = path.join(ROOT, 'CODE_OF_CONDUCT.md');

    test('file exists', () => {
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('file is not empty', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    test('contains a code of conduct heading', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/code of conduct/i);
    });

    test('contains enforcement section', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/enforcement/i);
    });

    test('contains reporting contact information', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      // Should have some contact info (email or link) for reporting violations
      expect(content).toMatch(/@|https?:\/\//);
    });

    test('contains community pledge or standards', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/pledge|standards/i);
    });
  });

  describe('SECURITY.md', () => {
    const filePath = path.join(ROOT, 'SECURITY.md');

    test('file exists', () => {
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('file is not empty', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    test('contains security heading or topic', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/security/i);
    });

    test('contains reporting instructions', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/report/i);
    });

    test('discourages public disclosure of vulnerabilities', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      // Should instruct reporters NOT to use public issues
      expect(content).toMatch(/do not|please do not|not (report|disclose)/i);
    });

    test('provides a private contact method', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      // Should include an email address or another private contact channel
      expect(content).toMatch(/@/);
    });
  });

  describe('profile/README.md', () => {
    const filePath = path.join(ROOT, 'profile', 'README.md');

    test('file exists', () => {
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('file is not empty', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    test('contains a heading (level 1 or 2)', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      // Profile READMEs commonly use level-2 headings; accept both ## and #
      expect(content).toMatch(/^#{1,2}\s+/m);
    });
  });
});
