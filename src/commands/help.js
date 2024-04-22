import fs from 'node:fs';
import path from 'node:path';
import { getBaseDotfileDirectory } from '../utils/getBaseDotfileDirectory.js';
import { parseINIFile } from '../parser.js';
const chalk = (await import('chalk')).default;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * @param {string} cwd Current working directory
 */
export default async function help(cwd) {
  let helpString = '\nUsage:\n  operandum <command>\n\nCommands:';
  const filenames = fs.readdirSync(__dirname);
  filenames.sort();

  for (const filename of filenames) {
    const description = (await import('./' + filename))?.DESCRIPTION;
    const usage = (await import('./' + filename))?.USAGE;
    if (!description) continue;

    const command = filename.slice(0, -3);
    helpString += `\n  ${command} - ${description}`;
    if (usage) helpString += `\n    -> Usage: ${chalk.bgWhite.black(` ${usage} `)}`;
    helpString += '\n';
  }

  console.log(helpString);
  const baseDir = getBaseDotfileDirectory(cwd);
  if (baseDir) {
    const config = parseINIFile(`${baseDir}/operandum.ini`);
    if (!config) return;

    const dotfilesDir = config?.dotfiles;
    const tasksDir = config?.tasks;
    let dotfilesCount = 0;
    let tasksCount = 0;
    if (dotfilesDir) {
      const dotfiles = fs.readdirSync(`${baseDir}/${dotfilesDir}`);
      dotfilesCount = dotfiles.length;
    }
    if (tasksDir) {
      const tasks = fs
        .readdirSync(`${baseDir}/${tasksDir}`, { withFileTypes: true });
      tasksCount = tasks.length;
    }

    console.log();
    if (dotfilesCount > 0 && tasksCount > 0) {
      console.log(`Managing ${dotfilesCount} Dotfiles and ${tasksCount} Tasks.`);
    } else if (dotfilesCount > 0 && tasksCount < 0) {
      console.log(`Managing ${dotfilesCount} Dotfiles.`);
    } else if (dotfilesCount < 0 && tasksCount > 0) {
      console.log(`Managing ${tasksCount} Tasks.`);
    } else {
      console.log(chalk.green('Start managing your Dotfiles, Tasks, and Scripts now!'));
      console.log(chalk.underline.green('https://github.com/NihadBadalov/operandum#initialization'));
    }
  }
}

const DESCRIPTION = 'Shows a help message for operandum commands';
const USAGE = 'operandum help';
export { DESCRIPTION, USAGE };
