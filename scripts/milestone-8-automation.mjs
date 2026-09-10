#!/usr/bin/env node
/**
 * Milestone automation helper: refresh the milestone status docs
 * from the upstream tracker. Run with `npm run docs:status`.
 */
import { execSync } from 'node:child_process';

console.log('Running milestone 8 automation (docs status refresh)...');
const output = execSync('node scripts/update-status-docs.mjs', { encoding: 'utf8', cwd: '.' });
console.log(output.trim());
