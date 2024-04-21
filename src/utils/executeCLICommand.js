const { exec } = await import('node:child_process');
const chalk = (await import('chalk')).default;

/**
 * Callback for adding two numbers.
 *
 * @callback successCallback
 * @param {ExecException | null} err Error object
 * @param {string} stdout Standard output
 * @param {string} stderr Standard error
 */


/**
 * @param {string} command Command to execute
 * @param {string} baseDir Base directory to execute the command
 * @param {successCallback | null} callback Callback to execute on success
 * @param {string | null} password
 * @param {boolean | undefined} verbose Whether to show verbose output
 * @param {boolean | undefined} ignoreErrors Whether to ignore errors
 */
export async function executeCLICommand(command, baseDir, callback, password, ignoreErrors = false, verbose = true) {
  password ||= null;
  return new Promise((resolve, reject) => {
    exec(command, { cwd: baseDir }, (err, stdout, stderr) => {
      if (err && !ignoreErrors) {
        if (verbose) console.error(chalk.red(err.message));
        reject(undefined);
      } else {
        if (callback) callback(err, stdout, stderr);
        if (stdout) console.log(chalk.green(`Output:`), stdout);
        if (verbose && stderr && !stderr.startsWith('Password:') && !ignoreErrors)
          console.error(chalk.redBright(`Errors/Warnings: ${stderr}`));
        resolve(undefined);
      }
    });
  });
}
