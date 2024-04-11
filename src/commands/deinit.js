import fs from 'node:fs';
const chalk = (await import('chalk')).default;

/**
 * @param {string} workDir Directory where the command is called from - pwd
 */
export default async function deinit(workDir) {
  if (!fs.existsSync(`${workDir}/operandum.ini`)) return;

  try {
    fs.rmSync(`${workDir}/operandum.ini`);
    console.log();
    console.log(chalk.green('operandum.ini removed'));
  } catch (e) {
    console.error(chalk.bgRed.white('Error: in deinit:'), chalk.red(e));
  }
}

const DESCRIPTION = 'Removes operandum and its config file in the current directory';
const USAGE = 'operandum deinit';
export { DESCRIPTION, USAGE };
