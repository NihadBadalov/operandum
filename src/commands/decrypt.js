import { intro, outro, text } from '@clack/prompts';
import fs from 'node:fs';
import { handleCancel } from '../utils/handleClackCancel.js';
import { decryptAES256 } from '../crypto.js';
import { parseINIFile } from '../parser.js';
const chalk = (await import('chalk')).default;

/**
 * @param {string} workDir Current working directory (cwd)
 * @param {string} filename File name to decrypt
 * @param {string} pswd Provided password for decryption
 * @returns {Promise<void>}
 */
export default async function decrypt(workDir, filename, pswd = '') {
  if (filename.endsWith('/*')) {
    const config = parseINIFile(`${workDir}/operandum.ini`);
    if (!config)
      return console.error(chalk.bgRed.white(`Error: in decrypt(): Unable to read operandum.ini`));

    if (!fs.existsSync(workDir))
      return console.error(chalk.bgRed.white(`Error: in decrypt(): Directory ${workDir} does not exist`));

    if (filename.startsWith('./')) filename = filename.slice(2);
    if (filename.endsWith('/*')) filename = filename.slice(0, -2);

    const workDirFiles = fs
      .readdirSync(`${workDir}/${config.tasks}/${filename}`)
      .filter((file) => !fs.lstatSync(`${workDir}/${config.tasks}/${filename}/${file}`).isDirectory());

    for (const file of workDirFiles) {
      console.log('-', chalk.yellow('Decrypting file:'), `${workDir}/${config.tasks}/${filename}/${file}`);
      await decrypt(workDir, `${config.tasks}/${filename}/${file}`, pswd);
    }
    return;
  } else if (!fs.existsSync(`${workDir}/${filename}`))
    return console.error(chalk.bgRed.white(`Error: in decrypt(): File ${filename} does not exist`));


  const file = fs.readFileSync(`${workDir}/${filename}`, 'utf-8');
  if (!file)
    return console.error(chalk.bgRed.white(`Error: in decrypt(): Unable to read file ${filename}`));

  if (!pswd) intro(chalk.bgWhite.black(' operandum '));

  const password = pswd || await text({
    message: 'Enter password to decrypt file',
    validate: (input) => {
      if (input.length < 1) return 'Password must be at least 1 character';
    },
  });
  if (!pswd) handleCancel(password);

  const decrypted = decryptAES256(file, password);

  fs.writeFileSync(`${workDir}/${filename}`, decrypted, 'utf-8');
  if (!pswd) outro(chalk.green(`File ${filename} decrypted successfully`));
  else console.log(chalk.green(`- File ${filename} decrypted successfully`));
}

const DESCRIPTION = 'AES-256-CBC decryption of a file';
const USAGE = 'operandum decrypt <filename>';
export { DESCRIPTION, USAGE };
