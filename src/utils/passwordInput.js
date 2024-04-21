import { read } from 'read';
const chalk = (await import('chalk')).default;

/**
  * @param {string} prompt Prompt message
  * @returns {Promise<string | boolean>} Returns password (`string`); `false` on error
  */
export async function inputPassword(prompt = 'Password: ') {
  try {
    const password = await read({
      prompt: prompt,
      silent: true,
      replace: "*",
    });

    if (password?.length < 1) {
      console.error(chalk.red('Password cannot be empty.'));
      return false;
    } else return password;
  } catch (error) {
    console.error(chalk.red('Password cannot be empty.'));
    return false;
  }
}
