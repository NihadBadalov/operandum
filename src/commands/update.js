import fs from 'node:fs';
import { getBaseDotfileDirectory } from '../utils/getBaseDotfileDirectory.js';
const chalk = (await import('chalk')).default;

/**
 * @param {string} cwd Current working directory
  * @returns {Promise<string | boolean>} Promise that resolves to true if the dotfiles were updated successfully; otherwise, error message
 */
export default async function update(cwd) {
  const baseDir = getBaseDotfileDirectory(cwd);
  if (!baseDir) {
    console.error(chalk.red(`No ${chalk.bgWhite.red(' operandum.ini ')} file found in the current directory or any of its parent directories.`));
    return;
  }

  const isGitDir = fs.existsSync(`${baseDir}/.git`);
  if (!isGitDir) {
    console.error(chalk.red(`No ${chalk.bgWhite.red(' .git ')} directory found in the current directory or any of its parent directories.\nPlease initialize a git repository before running this command.`));
    return;
  }

  console.log(chalk.yellow('Updating dotfiles...'));
  const { exec } = await import('node:child_process');
  return new Promise((res, rej) => {
    exec('git pull', { cwd: baseDir }, (err, _stdout, _stderr) => {
      if (err) {
        console.error(chalk.red('Error updating dotfiles:'));
        console.error(chalk.red(err.message));
        rej(err.message);
      }

      console.log(chalk.green('Dotfiles updated successfully.'));
      res(true);
    });
  });
}

const DESCRIPTION = `(Git) pull Dotfiles from the remote repository.`;
const USAGE = 'operandum stow';
export { DESCRIPTION, USAGE };
