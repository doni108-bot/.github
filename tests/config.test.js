'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_DIR = path.join(ROOT, 'config');

/**
 * Tests for the repolinter ruleset configuration files.
 * Both the JSON and YAML variants must be syntactically valid,
 * structurally consistent, and contain the expected rules.
 */

const REQUIRED_RULES = [
  'license-file-is-MIT',
  'readme-file-exists',
  'codeowners-file-exists',
];

const VALID_RULE_LEVELS = ['off', 'warning', 'error'];
const VALID_RULE_TYPES = [
  'file-contents',
  'file-existence',
  'file-not-exists',
  'file-create',
  'file-type-not-exists',
  'directory-existence',
  'license-detect',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function loadYAML(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return yaml.load(raw);
}

// ─── Shared rule-level assertions ────────────────────────────────────────────

function assertRulesetStructure(ruleset, label) {
  describe(`${label} - top-level structure`, () => {
    test('has a version field equal to 2', () => {
      expect(ruleset.version).toBe(2);
    });

    test('has an axioms field', () => {
      expect(ruleset).toHaveProperty('axioms');
    });

    test('has a rules field that is an object', () => {
      expect(ruleset).toHaveProperty('rules');
      expect(typeof ruleset.rules).toBe('object');
      expect(ruleset.rules).not.toBeNull();
    });

    test('has a formatOptions field', () => {
      expect(ruleset).toHaveProperty('formatOptions');
    });

    test('formatOptions contains a disclaimer', () => {
      expect(ruleset.formatOptions).toHaveProperty('disclaimer');
      expect(typeof ruleset.formatOptions.disclaimer).toBe('string');
      expect(ruleset.formatOptions.disclaimer.trim().length).toBeGreaterThan(0);
    });
  });

  describe(`${label} - required rules`, () => {
    REQUIRED_RULES.forEach((ruleName) => {
      test(`contains rule: ${ruleName}`, () => {
        expect(ruleset.rules).toHaveProperty(ruleName);
      });
    });
  });

  describe(`${label} - rule structure`, () => {
    test('every rule has a "level" field with a valid value', () => {
      Object.entries(ruleset.rules).forEach(([name, rule]) => {
        expect(VALID_RULE_LEVELS).toContain(rule.level);
      });
    });

    test('every rule has a "rule" sub-object', () => {
      Object.entries(ruleset.rules).forEach(([name, rule]) => {
        expect(rule).toHaveProperty('rule');
        expect(typeof rule.rule).toBe('object');
      });
    });

    test('every rule sub-object has a "type" field', () => {
      Object.entries(ruleset.rules).forEach(([name, rule]) => {
        expect(rule.rule).toHaveProperty('type');
        expect(typeof rule.rule.type).toBe('string');
      });
    });

    test('every rule sub-object has an "options" field', () => {
      Object.entries(ruleset.rules).forEach(([name, rule]) => {
        expect(rule.rule).toHaveProperty('options');
        expect(typeof rule.rule.options).toBe('object');
      });
    });

    test('rules with fixes have a valid fix type', () => {
      Object.entries(ruleset.rules).forEach(([name, rule]) => {
        if (rule.fix) {
          expect(rule.fix).toHaveProperty('type');
          expect(typeof rule.fix.type).toBe('string');
        }
      });
    });
  });

  describe(`${label} - license-file-is-MIT rule`, () => {
    test('rule type is file-contents', () => {
      expect(ruleset.rules['license-file-is-MIT'].rule.type).toBe('file-contents');
    });

    test('options include LICENSE and COPYING globs', () => {
      const opts = ruleset.rules['license-file-is-MIT'].rule.options;
      const globs = opts.globsAll || opts.globsAny || [];
      expect(globs.some((g) => /LICENSE/i.test(g))).toBe(true);
      expect(globs.some((g) => /COPYING/i.test(g))).toBe(true);
    });

    test('options require MIT License content', () => {
      const opts = ruleset.rules['license-file-is-MIT'].rule.options;
      expect(opts.content).toMatch(/MIT License/i);
    });

    test('has a fix action', () => {
      expect(ruleset.rules['license-file-is-MIT']).toHaveProperty('fix');
    });

    test('has policyInfo', () => {
      const rule = ruleset.rules['license-file-is-MIT'];
      expect(rule).toHaveProperty('policyInfo');
      expect(rule.policyInfo.trim().length).toBeGreaterThan(0);
    });

    test('has policyUrl', () => {
      const rule = ruleset.rules['license-file-is-MIT'];
      expect(rule).toHaveProperty('policyUrl');
      expect(rule.policyUrl).toMatch(/^https?:\/\//);
    });
  });

  describe(`${label} - readme-file-exists rule`, () => {
    test('rule type is file-existence', () => {
      expect(ruleset.rules['readme-file-exists'].rule.type).toBe('file-existence');
    });

    test('options include a README glob', () => {
      const opts = ruleset.rules['readme-file-exists'].rule.options;
      const globs = opts.globsAny || opts.globsAll || [];
      expect(globs.some((g) => /README/i.test(g))).toBe(true);
    });

    test('has a fix action', () => {
      expect(ruleset.rules['readme-file-exists']).toHaveProperty('fix');
    });
  });

  describe(`${label} - codeowners-file-exists rule`, () => {
    test('rule type is file-existence', () => {
      expect(ruleset.rules['codeowners-file-exists'].rule.type).toBe('file-existence');
    });

    test('options include CODEOWNERS globs', () => {
      const opts = ruleset.rules['codeowners-file-exists'].rule.options;
      const globs = opts.globsAny || opts.globsAll || [];
      expect(globs.some((g) => /CODEOWNERS/i.test(g))).toBe(true);
    });

    test('checks both root and .github/ locations', () => {
      const opts = ruleset.rules['codeowners-file-exists'].rule.options;
      const globs = opts.globsAny || opts.globsAll || [];
      const hasGithubPath = globs.some((g) => g.includes('.github/'));
      expect(hasGithubPath).toBe(true);
    });

    test('has a fix action', () => {
      expect(ruleset.rules['codeowners-file-exists']).toHaveProperty('fix');
    });
  });
}

// ─── JSON config tests ────────────────────────────────────────────────────────

describe('config/repolinter-ruleset.json', () => {
  const filePath = path.join(CONFIG_DIR, 'repolinter-ruleset.json');

  test('file exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('is valid JSON', () => {
    expect(() => loadJSON(filePath)).not.toThrow();
  });

  test('contains a $schema field', () => {
    const ruleset = loadJSON(filePath);
    expect(ruleset).toHaveProperty('$schema');
    expect(ruleset.$schema).toMatch(/^https?:\/\//);
  });

  // Run shared structure assertions on the parsed JSON ruleset
  const ruleset = (() => {
    try {
      return loadJSON(filePath);
    } catch {
      return {};
    }
  })();
  assertRulesetStructure(ruleset, 'JSON');
});

// ─── YAML config tests ────────────────────────────────────────────────────────

describe('config/repolinter-ruleset.yaml', () => {
  const filePath = path.join(CONFIG_DIR, 'repolinter-ruleset.yaml');

  test('file exists', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('is valid YAML', () => {
    expect(() => loadYAML(filePath)).not.toThrow();
  });

  test('contains a $schema field', () => {
    const ruleset = loadYAML(filePath);
    expect(ruleset).toHaveProperty('$schema');
    expect(ruleset.$schema).toMatch(/^https?:\/\//);
  });

  // Run shared structure assertions on the parsed YAML ruleset
  const ruleset = (() => {
    try {
      return loadYAML(filePath);
    } catch {
      return {};
    }
  })();
  assertRulesetStructure(ruleset, 'YAML');
});

// ─── JSON ↔ YAML consistency tests ───────────────────────────────────────────

describe('JSON and YAML configs are consistent', () => {
  const jsonPath = path.join(CONFIG_DIR, 'repolinter-ruleset.json');
  const yamlPath = path.join(CONFIG_DIR, 'repolinter-ruleset.yaml');

  test('both files are present', () => {
    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(yamlPath)).toBe(true);
  });

  test('both have the same schema version', () => {
    const json = loadJSON(jsonPath);
    const yml = loadYAML(yamlPath);
    expect(json.version).toBe(yml.version);
  });

  test('both define the same set of rule names', () => {
    const json = loadJSON(jsonPath);
    const yml = loadYAML(yamlPath);
    const jsonRules = Object.keys(json.rules).sort();
    const yamlRules = Object.keys(yml.rules).sort();
    expect(jsonRules).toEqual(yamlRules);
  });

  test('rule levels are consistent between JSON and YAML', () => {
    const json = loadJSON(jsonPath);
    const yml = loadYAML(yamlPath);
    Object.keys(json.rules).forEach((ruleName) => {
      expect(json.rules[ruleName].level).toBe(yml.rules[ruleName].level);
    });
  });

  test('rule types are consistent between JSON and YAML', () => {
    const json = loadJSON(jsonPath);
    const yml = loadYAML(yamlPath);
    Object.keys(json.rules).forEach((ruleName) => {
      expect(json.rules[ruleName].rule.type).toBe(yml.rules[ruleName].rule.type);
    });
  });
});
