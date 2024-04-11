import { intro, outro, text } from '@clack/prompts';
import fs from 'node:fs';
import { handleCancel } from '../utils/handleClackCancel.js';
import { encryptAES256 } from '../crypto.js';
const chalk = (await import('chalk')).default;

/**
 * @param {string} workDir Current working directory (cwd)
 * @param {string} filename File name to encrypt
 */
export default async function encrypt(workDir, filename) {
  if (!fs.existsSync(`${workDir}/${filename}`))
    return console.error(chalk.bgRed.white(`Error: in encrypt(): File ${filename} does not exist`));

  const file = fs.readFileSync(`${workDir}/${filename}`, 'utf-8');
  if (!file)
    return console.error(chalk.bgRed.white(`Error: in encrypt(): Unable to read file ${filename}`));

  intro(chalk.bgWhite.black(' operandum '));

  const password = await text({
    message: 'Enter password to encrypt file',
    validate: (input) => {
      if (input.length < 1) return 'Password must be at least 1 character';
    },
  });
  handleCancel(password);

  const confirmPass = await text({
    message: 'Confirm password',
    validate: (input) => {
      if (input !== password) return 'Passwords do not match';
    },
  });
  handleCancel(confirmPass);

  const encrypted = encryptAES256(file, password);

  fs.writeFileSync(`${workDir}/${filename}`, encrypted, 'utf-8');
  outro(chalk.green(`File ${filename} encrypted successfully`));
}


const DESCRIPTION = 'AES-256-CBC encryption of a file';
const USAGE = 'operandum encrypt <filename>';
export { DESCRIPTION, USAGE };
