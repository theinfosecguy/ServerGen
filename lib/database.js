/**
 * Database option helpers for CLI parsing, validation, and generation.
 * @module lib/database
 */

const FALSE_VALUES = new Set([false, undefined, null, '', 'none', 'no', 'n', 'false']);
const MONGO_VALUES = new Set(['mongo', 'mongodb', 'mongoose']);
const POSTGRES_VALUES = new Set(['postgres', 'postgresql']);
const PRISMA_VALUES = new Set(['prisma']);

const normalizeValue = (value) => (
  typeof value === 'string' ? value.trim().toLowerCase() : value
);

/**
 * Normalizes supported database CLI values.
 * @param {boolean|string|undefined|null} value - Raw database option value.
 * @returns {false|'mongodb'|'postgres'|string} Normalized option value.
 */
export const normalizeDatabaseOption = (value) => {
  const normalized = normalizeValue(value);
  if (FALSE_VALUES.has(normalized)) {
    return false;
  }
  if (MONGO_VALUES.has(normalized)) {
    return 'mongodb';
  }
  if (POSTGRES_VALUES.has(normalized)) {
    return 'postgres';
  }
  return normalized;
};

/**
 * Normalizes supported ORM CLI values.
 * @param {string|undefined|null} value - Raw ORM option value.
 * @returns {undefined|'prisma'|string} Normalized option value.
 */
export const normalizeOrmOption = (value) => {
  const normalized = normalizeValue(value);
  if (FALSE_VALUES.has(normalized)) {
    return undefined;
  }
  if (PRISMA_VALUES.has(normalized)) {
    return 'prisma';
  }
  return normalized;
};

export const isMongoDatabase = (value) => normalizeDatabaseOption(value) === 'mongodb';

export const isPostgresDatabase = (value) => normalizeDatabaseOption(value) === 'postgres';

export const isPostgresPrisma = (db, orm) => (
  isPostgresDatabase(db) && normalizeOrmOption(orm) === 'prisma'
);
