import { executeCLICommand } from "../utils/executeCLICommand.js";

const BUILTIN_PREFIX = 'operandum.builtin.';

/**
 * Copy a file
 * @param {import("../commands/execute").Action} action Action to execute
  * @param {string} baseDir Base directory to execute the command
 * @param {{[key: string]: any}} vars Variables specified in the Task
 * @param {string} password Password to use
 */
export async function copy(action, baseDir, vars, password) {
  const functionName = BUILTIN_PREFIX + 'copy';

  if (!('src' in action[functionName]) || !('dest' in action[functionName])) {
    console.error("- Error: 'src' or 'dest' not found in properties.");
    return;
  }

  /** @type {string} */
  let src = action[functionName]['src'];
  /** @type {string} */
  let dest = action[functionName]['dest'];
  /** @type {boolean | undefined} */
  let recursive = action[functionName]['recursive'];

  // Replace variables in the src and dest
  for (const [key, value] of Object.entries(vars)) {
    src = src
      .replaceAll(`{{ ${key} }}`, value)
      .replaceAll(`{{${key}}}`, value);
    dest = dest
      .replaceAll(`{{ ${key} }}`, value)
      .replaceAll(`{{${key}}}`, value);
  }


  // Check if the file exists
  let command = action.superuser
    ? `cd tasks && echo ${password} | sudo -S cp ${recursive ? '-r' : ''} ${src} ${dest}`
    : `cd tasks && cp ${recursive ? '-r' : ''} ${src} ${dest}`;

  console.log("- Copying file...");

  await executeCLICommand(command, baseDir, null, password, action.ignore_errors, true)
    .then(() => console.log("- File copied successfully."))
    .catch((err) => console.error("- Error copying file:", err));
}
