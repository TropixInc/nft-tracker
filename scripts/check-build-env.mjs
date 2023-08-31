#!/usr/bin/env zx

/* eslint-disable no-undef */

/* We are checking to see if the environment variables are set. */
const ENV_KEYS = ['NODE_ENV', 'GITHUB_TOKEN'];

console.log('Checking environment variables ...');

let errors = 0;
ENV_KEYS.forEach((key) => {
  const value = process.env[key];
  if (!value) {
    console.log(chalk.red(`${key}=<MISSING>`));
    errors += 1;
  } else {
    console.log(chalk.blue(`${key}=${value}`));
  }
});

if (errors) {
  console.log(chalk.red(`\nExiting due to ${errors} missing environment variables.`));
  process.exit(1);
} else {
  console.log(chalk.green('\nAll environment variables are set.'));
  process.exit(0);
}