const chalk = (await import('chalk')).default;
import fs from 'node:fs';
import { getBaseDotfileDirectory } from '../utils/getBaseDotfileDirectory.js';
import { handleCancel } from '../utils/handleClackCancel.js';
import { parse } from 'yaml';
import { parseINIFile } from '../parser.js';
import { inputPassword } from '../utils/passwordInput.js';
import builtinFunctions from '../builtin/index.js';
import { executeCLICommand } from '../utils/executeCLICommand.js';

/**
  * Names of builtin functions
  * @typedef {"copy" | "shell" | "assert"} BuiltinFunctions
 */

/**
  * Action keys of properties
  * @typedef {"name" | "action" | "superuser"} ActionKey
 */

/**
  * Action keys of builtin functions
  * @typedef {"operandum.builtin.copy"
    * | "operandum.builtin.shell"
    * | "operandum.builtin.assert"} ActionKeyOfBuiltinFunctions
 */

/**
  * A task
  * @typedef {{
    * [key: ActionKey | ActionKeyOfBuiltinFunctions]: string;
    * name: string;
    * action: string;
    * superuser?: boolean;
    * ignore_errors?: boolean;
  * }} Action
  */

/**
 * @param {string} cwd Current working directory
 * @param {string} taskName Name of the task to execute
 */
export default async function execute(cwd, taskName) {
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
  if (!fs.existsSync(`${baseDir}/${config.tasks}`)) {
    console.error(chalk.red(`No Tasks directory found at ${chalk.bgWhite.red(baseDir)}. Please make sure the directory exists and is spelled correctly in ${chalk.bgWhite.red(' operandum.ini ')}.`));
    return;
  }

  if (!fs.existsSync(`${baseDir}/${config.tasks}/${taskName}.yaml`)) {
    console.error(chalk.red(`Task ${chalk.bgWhite.red(taskName)} not found in ${chalk.bgWhite.red(config.tasks)} directory.`)); console.error(chalk.red(`Please make sure the task exists and is spelled correctly. The file should be a YAML file: ${chalk.bgWhite.red(` ${taskName}.yaml `)}`));
    return;
  }

  console.log(`Parsing  ${chalk.green(`${taskName}`)}...`);
  const taskFile = fs.readFileSync(`${baseDir}/${config.tasks}/${taskName}.yaml`, 'utf-8');
  const task = parse(taskFile);
  /** @type {{[key: string]: string}} */
  const vars = {};
  /** @type {Action[]} */
  const actions = task?.actions || {};
  if (task?.vars) {
    let i = 1;
    for (const { name, value } of task.vars) {
      if (!name || !value) {
        console.error(chalk.red(`Error parsing var number ${i} in ${chalk.bgWhite.red(' vars ')} in ${chalk.bgWhite.red(`${taskName}.yaml`)}`));
        continue;
      }
      vars[name] = value;
      i++;
    }
  }
  const requriesSuperuserPassword = actions.some((t) => t?.superuser);

  let password = '';
  if (requriesSuperuserPassword) {
    console.log();
    // password
    password = await inputPassword();
    if (!password) return process.exit(0);
    console.log();
    console.log();
  }

  let actionNum = 1;
  let successes = 0,
    failures = 0;
  const timeStart = Date.now();
  for (const action of actions) {
    const { name, superuser, ...actionKeys } = action;
    console.log(chalk.yellow.bold(`\n${actionNum}. Action: ${name}`));

    try {
      let errored = false;
      for (const [key, _] of Object.entries(actionKeys)) {
        if (!key.startsWith('operandum.builtin.')) continue;

        const builtinFunctionName = key.slice('operandum.builtin.'.length);
        if (!(builtinFunctionName in builtinFunctions)) continue;

        await builtinFunctions[builtinFunctionName](action, baseDir, vars, password)
          .then(() => { successes++; })
          .catch((e) => { failures++; errored = true; console.log(e?.msg || e); });
      }

      if (actionKeys.action) {
        let command = superuser ? `cd tasks && echo ${password} | sudo -S ${actionKeys.action}` : 'cd tasks && ' + actionKeys.action;
        for (const [key, value] of Object.entries(vars)) {
          command = command
            .replaceAll(`{{ ${key} }}`, value)
            .replaceAll(`{{${key}}}`, value);
        }

        await executeCLICommand(command, baseDir, () => {
          console.log(chalk.green(`Action ${chalk.bold(` ${name} `)} executed successfully`));
        }, password, actionKeys.ignore_errors, true)
          .then(() => { successes++; })
          .catch((e) => { if (!errored) failures++; console.log(e?.msg || e);});
      }
    } catch (error) {
      console.error('Error: ', error);
    }
    actionNum++;
  }

  console.log();
  if (failures === 0) console.log(chalk.green.bold(`\nTask ${taskName} executed successfully.`));
  else console.error(chalk.red.bold(`\nTask ${taskName} failed.`));
  console.log(chalk.yellow.bold(`${successes + failures} actions executed in ${((Date.now() - timeStart) / 1000).toFixed(2)} seconds.`));
}

const DESCRIPTION = `Execute a task from the Tasks`;
const USAGE = 'operandum execute <task-name>';
export { DESCRIPTION, USAGE };
