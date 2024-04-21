import decryptFile from "../commands/decrypt.js";
import { inputPassword } from "../utils/passwordInput.js";

const BUILTIN_PREFIX = 'operandum.builtin.';

/**
 * Decrypt a file
 * @param {import("../commands/execute").Action} action Action in yaml that triggers this function
 * @param {string} baseDir Base directory of the command
 * @param {{[key: string]: any}} vars Variables specified in the Task
 * @param {string} _ Superuser password to use
 */
export async function decrypt(action, baseDir, vars, _) {
  const functionName = BUILTIN_PREFIX + 'decrypt';

  if (!('src' in action[functionName])
    || !('password' in action[functionName] || 'ask_encryption_password' in action[functionName])) {
    console.error("- Error: 'src' or 'password'/'ask_encryption_password' not found in properties.");
    return;
  }

  /** @type {string} */
  let src = action[functionName]['src'];
  /** @type {string | undefined} */
  let encryptionPassword = action[functionName]['password'];
  /** @type {boolean | undefined} */
  let askEncryptionPassword = action[functionName]['ask_encryption_password'];

  if (typeof encryptionPassword === 'number') encryptionPassword = encryptionPassword.toString();
  if (askEncryptionPassword) {
    encryptionPassword = await inputPassword();
    if (!encryptionPassword) return process.exit(0);
  }

  // Replace variables in the src and dest
  for (const [key, value] of Object.entries(vars)) {
    src = src
      .replaceAll(`{{ ${key} }}`, value)
      .replaceAll(`{{${key}}}`, value);
    encryptionPassword = encryptionPassword
      ?.replaceAll(`{{ ${key} }}`, value)
      ?.replaceAll(`{{${key}}}`, value);
  }

  // Check if the file exists
  // baseDir does not have to be sanitized as this builtin function is called
  // from within the program, where it was already sanitized
  await decryptFile(baseDir, src, encryptionPassword);
}
