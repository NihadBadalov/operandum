import fs from 'node:fs';
import path from 'node:path';
const chalk = (await import('chalk')).default;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default async function help() {
  let helpString = '\nUsage:\n  operandum <command>\n\nCommands:';
  const filenames = fs.readdirSync(__dirname);
  filenames.sort();

  for (const filename of filenames) {
    const description = (await import('./' + filename))?.DESCRIPTION;
    const usage = (await import('./' + filename))?.USAGE;
    if (!description) continue;

    const command = filename.slice(0, -3);
    helpString += `\n  ${command} - ${description}`;
    if (usage) helpString += `\n    -> Usage: ${chalk.bgWhite.black(` ${usage} `)}`;
    helpString += '\n';
  }

  console.log(helpString);
  // TODO: managing N tasks, N dotfiles
}

const DESCRIPTION = 'Shows a help message for operandum commands.';
const USAGE = 'operandum help [command - optional]';
export { DESCRIPTION, USAGE };
