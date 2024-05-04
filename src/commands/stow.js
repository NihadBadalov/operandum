import fs from 'node:fs';
import { parseINIFile } from "../parser.js";
import { getDotfileStowDirectories } from '../utils/getDotfileStowDirectories.js';
import { getBaseDotfileDirectory } from '../utils/getBaseDotfileDirectory.js';
const chalk = (await import('chalk')).default;

/**
 * @param {string} cwd Current working directory
 * @param {boolean} force If true, existing symlinks will be overwritten without confirmation and replaced
 * @param {boolean} recursive If true, stow will create non-existent parent directories
 */
export default async function stow(cwd, force, recursive) {
  const baseDir = getBaseDotfileDirectory(cwd);
  if (!baseDir) {
    console.error(chalk.red(`No ${chalk.bgWhite.red(' operandum.ini ')} file found in the current directory or any of its parent directories.`));
    return;
  }

  if (!fs.existsSync(`${baseDir}/operandum.ini`)) {
    console.error(chalk.red(`No ${chalk.bgWhite.red(' operandum.ini ')} file found in the current directory or any of its parent directories.`));
    return;
  }

  const config = parseINIFile(`${baseDir}/operandum.ini`);
  if (!config) {
    console.error(chalk.red(`Error parsing ${chalk.bgWhite.red(' operandum.ini ')} file.`));
    return;
  }
  if (!fs.existsSync(`${baseDir}/${config.dotfiles}`)) {
    console.error(chalk.red(`No Dotfiles directory found at ${chalk.bgWhite.red(baseDir)}. Please make sure the directory exists and is spelled correctly in ${chalk.bgWhite.red(' operandum.ini ')}.`));
    return;
  }

  console.log('Stowing Dotfiles...');
  const dotfileStowDirectories = getDotfileStowDirectories(`${baseDir}/${config.dotfiles}`, true);
  if (typeof dotfileStowDirectories === 'string') {
    console.error(`Failed to stow Dotfiles: could not get dotfile stow directories: ${dotfileStowDirectories}`);
    return;
  }

  for (const [dotfileFilePath, stowPath] of Object.entries(dotfileStowDirectories)) {
    if (!fs.existsSync(dotfileFilePath)) {
      console.error(`Failed to stow ${dotfileFilePath}: file does not exist`);
      continue;
    }

    if (!fs.existsSync(stowPath.slice(0, stowPath.lastIndexOf('/')))) {
      if (recursive) {
        fs.mkdirSync(stowPath.slice(0, stowPath.lastIndexOf('/')), { recursive: true });
      } else {
        console.error(`Failed to stow ${dotfileFilePath}: stow directory does not exist`);
        continue;
      }
    }

    let isBrokenSymlink = false;
    try {
      isBrokenSymlink = !!fs.lstatSync(stowPath).isSymbolicLink();
    } catch (e) {
      isBrokenSymlink = false;
    }
    if (fs.existsSync(stowPath) || isBrokenSymlink) {
      if (fs.lstatSync(stowPath).isSymbolicLink()) {
        if (force) {
          fs.unlinkSync(stowPath);
        } else {
          console.error(`Failed to stow ${dotfileFilePath}: file already exists at stow location`);
          continue;
        }
      }
      else if (fs.lstatSync(stowPath).isDirectory()) {
        console.error(`Failed to stow ${dotfileFilePath}: directory already exists at stow location`);
      }
      else {
        if (force) {
          fs.unlinkSync(stowPath);
        } else {
          console.error(`Failed to stow ${dotfileFilePath}: file already exists at stow location`);
        }
      }
    }

    fs.symlinkSync(dotfileFilePath, stowPath);
    console.log(`Stowed ${dotfileFilePath} at ${stowPath}`);
  }
  console.log('Done stowing Dotfiles.');
}

const DESCRIPTION = `Stows (symlinks) Dotfiles to their respective stow directories\n ${chalk.green(' More simply, this commands puts your Dotfiles in their places ')}`;
const USAGE = 'operandum stow';
export { DESCRIPTION, USAGE };
