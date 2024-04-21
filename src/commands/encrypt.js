import { intro, outro, text } from '@clack/prompts';
import fs from 'node:fs';
import { handleCancel } from '../utils/handleClackCancel.js';
import { encryptAES256 } from '../crypto.js';
import { parseINIFile } from '../parser.js';
const chalk = (await import('chalk')).default;

/**
 * @param {string} workDir Current working directory (cwd)
 * @param {string} filename File name to encrypt
 * @param {string} pswd Provided password for decryption
 * @returns {Promise<void>}
 */
export default async function encrypt(workDir, filename, pswd = '') {
  if (filename.endsWith('/*')) {
    const config = parseINIFile(`${workDir}/operandum.ini`);
    if (!config)
      return console.error(chalk.bgRed.white(`Error: in ecrypt(): Unable to read operandum.ini`));

    if (!fs.existsSync(workDir))
      return console.error(chalk.bgRed.white(`Error: in encrypt(): Directory ${workDir} does not exist`));

    if (filename.startsWith('./')) filename = filename.slice(2);
    if (filename.endsWith('/*')) filename = filename.slice(0, -2);

    const workDirFiles = fs
      .readdirSync(`${workDir}/${config.tasks}/${filename}`)
      .filter((file) => !fs.lstatSync(`${workDir}/${config.tasks}/${filename}/${file}`).isDirectory());

    for (const file of workDirFiles) {
      console.log('-', chalk.yellow('Encrypting file:'), `${workDir}/${config.tasks}/${filename}/${file}`);
      await encrypt(workDir, `${config.tasks}/${filename}/${file}`, pswd);
    }
    return;
  } else if (!fs.existsSync(`${workDir}/${filename}`))
    return console.error(chalk.bgRed.white(`Error: in encrypt(): File ${filename} does not exist`));


  const file = fs.readFileSync(`${workDir}/${filename}`, 'utf-8');
  if (!file)
    return console.error(chalk.bgRed.white(`Error: in encrypt(): Unable to read file ${filename}`));

  if (!pswd) intro(chalk.bgWhite.black(' operandum '));

  const password = pswd || await text({
    message: 'Enter password to encrypt file',
    validate: (input) => {
      if (input.length < 1) return 'Password must be at least 1 character';
    },
  });
  if (!pswd) handleCancel(password);

  const confirmPass = pswd || await text({
    message: 'Confirm password',
    validate: (input) => {
      if (input !== password) return 'Passwords do not match';
    },
  });
  if (!pswd) handleCancel(confirmPass);

  const encrypted = encryptAES256(file, password);

  fs.writeFileSync(`${workDir}/${filename}`, encrypted, 'utf-8');
  if (!pswd) outro(chalk.green(`File ${filename} encrypted successfully`));
  else console.log(chalk.green(`- File ${filename} encrypted successfully`));
}

const DESCRIPTION = 'AES-256-CBC encryption of a file';
const USAGE = 'operandum encrypt <filename>';
export { DESCRIPTION, USAGE };
