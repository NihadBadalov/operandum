import { intro, outro, text } from '@clack/prompts';
import fs from 'node:fs';
import { handleCancel } from '../utils/handleClackCancel.js';
import { decryptAES256 } from '../crypto.js';
const chalk = (await import('chalk')).default;

/**
 * @param {string} workDir Current working directory (cwd)
 * @param {string} filename File name to decrypt
 * @returns {Promise<void>}
 */
export default async function decrypt(workDir, filename) {
  if (!fs.existsSync(`${workDir}/${filename}`))
    return console.error(chalk.bgRed.white(`Error: in decrypt(): File ${filename} does not exist`));

  const file = fs.readFileSync(`${workDir}/${filename}`, 'utf-8');
  if (!file)
    return console.error(chalk.bgRed.white(`Error: in decrypt(): Unable to read file ${filename}`));

  intro(chalk.bgWhite.black(' operandum '));

  const password = await text({
    message: 'Enter password to decrypt file',
    validate: (input) => {
      if (input.length < 1) return 'Password must be at least 1 character';
    },
  });
  handleCancel(password);

  const decrypted = decryptAES256(file, password);

  fs.writeFileSync(`${workDir}/${filename}`, decrypted, 'utf-8');
  outro(chalk.green(`File ${filename} decrypted successfully`));
}

const DESCRIPTION = 'AES-256-CBC decryption of a file';
const USAGE = 'operandum decrypt <filename>';
export { DESCRIPTION, USAGE };
