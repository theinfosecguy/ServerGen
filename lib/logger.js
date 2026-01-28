/**
 * Logging utility for consistent debug and info output.
 * @module lib/logger
 */

import chalk from 'chalk';
import { LOG_LEVELS } from './constants.js';

/** @type {number} Current log level */
let currentLevel = LOG_LEVELS.INFO;

/**
 * Sets the logging level.
 * @param {number} level - The log level to set.
 */
const setLevel = (level) => {
  currentLevel = level;
};

/**
 * Enables debug mode.
 */
const enableDebug = () => {
  currentLevel = LOG_LEVELS.DEBUG;
};

/**
 * Gets timestamp for log messages.
 * @returns {string} Formatted timestamp.
 */
const getTimestamp = () => {
  return new Date().toISOString().split('T')[1].split('.')[0];
};

/**
 * Logs an error message.
 * @param {string} message - The error message.
 * @param {Error} [error] - Optional error object.
 */
const error = (message, error = null) => {
  if (currentLevel >= LOG_LEVELS.ERROR) {
    console.error(chalk.red(`[ERROR] ${message}`));
    if (error && currentLevel >= LOG_LEVELS.DEBUG) {
      console.error(chalk.red(error.stack || error.message));
    }
  }
};

/**
 * Logs a warning message.
 * @param {string} message - The warning message.
 */
const warn = (message) => {
  if (currentLevel >= LOG_LEVELS.WARN) {
    console.warn(chalk.yellow(`[WARN] ${message}`));
  }
};

/**
 * Logs an info message.
 * @param {string} message - The info message.
 */
const info = (message) => {
  if (currentLevel >= LOG_LEVELS.INFO) {
    console.log(chalk.blue(`[INFO] ${message}`));
  }
};

/**
 * Logs a success message.
 * @param {string} message - The success message.
 */
const success = (message) => {
  if (currentLevel >= LOG_LEVELS.INFO) {
    console.log(chalk.green(`[OK] ${message}`));
  }
};

/**
 * Logs a debug message.
 * @param {string} message - The debug message.
 * @param {*} [data] - Optional data to log.
 */
const debug = (message, data = null) => {
  if (currentLevel >= LOG_LEVELS.DEBUG) {
    console.log(chalk.gray(`[DEBUG ${getTimestamp()}] ${message}`));
    if (data !== null) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }
};

/**
 * Logs a step in a process.
 * @param {string} step - The step description.
 */
const step = (step) => {
  if (currentLevel >= LOG_LEVELS.INFO) {
    console.log(chalk.cyan(`-> ${step}`));
  }
};

export {
  LOG_LEVELS,
  setLevel,
  enableDebug,
  error,
  warn,
  info,
  success,
  debug,
  step,
};
