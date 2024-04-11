#!/usr/bin/env node
const chalk = (await import('chalk')).default;

process.on('unhandledRejection', (err) => {
  throw err;
});

const args = process.argv.slice(2);
const workDir = process.cwd();

switch (args[0]) {
  case 'init':
    (await import('./commands/init.js')).default(workDir);
    break;

  case 'help':
    (await import('./commands/help.js')).default();
    break;

  case 'reinit':
    (await import('./commands/deinit.js')).default(workDir);
    (await import('./commands/init.js')).default(workDir);
    break;

  case 'encrypt':
    (await import('./commands/encrypt.js')).default(workDir, args[1]);
    break;

  case 'decrypt':
    (await import('./commands/decrypt.js')).default(workDir, args[1]);
    break;

  default:
    console.log('Invalid command');
    break;
}
