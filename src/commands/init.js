import fs from 'node:fs';
import { parseINIFile, writeToINIFile } from '../parser.js';
const chalk = (await import('chalk')).default;

import {
  confirm,
  intro,
  outro,
  text,
} from '@clack/prompts';
import { handleCancel } from '../utils/handleClackCancel.js';

const BLACKLISTED_FOLDER_SYMBOLS = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

/**
 * @param {string} workDir Directory where the command is called from - pwd
 */
export default async function init(workDir) {
  const iniFileExists = fs.existsSync(`${workDir}/operandum.ini`);
  if (iniFileExists) {
    console.log(chalk.red(`operandum.ini already exists - run ${chalk.bgRed.white(' npx operandum reinit ')} to reinitialize`));

    const ini = parseINIFile(`${workDir}/operandum.ini`);

    for (const key of ['tasks', 'dotfiles']) {
      if (!(key in ini)) {
        console.log(
          chalk.red(`Error: in init: '${key}' key does not exist in operandum.ini, run: `)
          + chalk.bgRed.white(' npx operandum reinit ')
        );

        return;
      }
    }
    return;
  }

  // No operandum.ini
  const ini = {};
  console.log();
  intro(chalk.bgWhite.black(' operandum '));

  const wantsDotfiles = await confirm({
    message: 'Do you want to manage your Dotfiles (config files)?',
  });
  handleCancel(wantsDotfiles);
  if (wantsDotfiles) {
    const dotfilesFolderName = await text({
      message: 'What do you want your Dotfiles folder to be called?',
      placeholder: 'Folder name for Dotfiles',
      initialValue: 'dotfiles',
      validate: (input) => {
        if (!input) return 'Dotfiles folder name cannot be empty';
        if (BLACKLISTED_FOLDER_SYMBOLS.some((symbol) => input.includes(symbol))) {
          return 'Dotfiles folder name cannot contain any of these symbols: / \\ : * ? " < > |';
        }
        if (fs.existsSync(`${workDir}/${input}`)) {
          return 'A folder with this name already exists';
        }
      },
    });
    handleCancel(dotfilesFolderName);
    ini['dotfiles'] = dotfilesFolderName;
  }

  const wantsTasks = await confirm({
    message: 'Do you want to manage your Tasks? (e.g. tasks upon OS installation, setup scripts, etc.)',
  });
  handleCancel(wantsTasks);
  if (wantsTasks) {
    const tasksFolderName = await text({
      message: 'What do you want your Tasks folder to be called?',
      placeholder: 'Folder name for Tasks',
      initialValue: 'tasks',
      validate: (input) => {
        if (!input) return 'Tasks folder name cannot be empty';
        if (BLACKLISTED_FOLDER_SYMBOLS.some((symbol) => input.includes(symbol))) {
          return 'Tasks folder name cannot contain any of these symbols: / \\ : * ? " < > |';
        }
        if (fs.existsSync(`${workDir}/${input}`)) {
          return 'A folder with this name already exists';
        }
      },
    });
    handleCancel(tasksFolderName);
    ini['tasks'] = tasksFolderName;
  }

  writeToINIFile(`${workDir}/operandum.ini`, ini);

  if (ini['dotfiles']) fs.mkdirSync(`${workDir}/${ini['dotfiles']}`);
  if (ini['tasks']) fs.mkdirSync(`${workDir}/${ini['tasks']}`);

  outro(`${chalk.bgGreen.black('operandum successfully initialized!\n\nView your config file at ')}${chalk.bgWhite.black(' operandum.ini ')}`);
}

const DESCRIPTION = 'Initializes operandum and its config file in the current directory';
const USAGE = 'operandum init';
export { DESCRIPTION, USAGE };
