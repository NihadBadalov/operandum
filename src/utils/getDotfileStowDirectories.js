import fs from 'node:fs';
import { parseINIFile } from '../parser.js';

// todo: when relative path is given (val starts with ../), resolve the path with node:path
/**
 * @param {string} path Path of the directory being stowed
 * @param {boolean} primary Whether the function call is the primary call or a recursive call
 * @returns {string|{[key: string]: string}} Tree of key-value pairs of dotfile directories and their stow directories; string if error
 */
export function getDotfileStowDirectories(path, primary = false) {
  let locations = parseINIFile(`${path}/locations.ini`) ?? {};
  const defaultStowLocation = locations['*'] ?? null;
  if (defaultStowLocation) delete locations['*'];
  const locationsIgnore = fs.existsSync(`${path}/locations.ignore`)
    ? [
      `${path}/locations.ignore`,
      `${path}/locations.ini`,
      ...fs
        .readFileSync(`${path}/locations.ignore`, 'utf8')
        .split('\n')
        .filter(e => e)
        .map(x => `${path}/${x}`),
    ]
    : [
      `${path}/locations.ignore`,
      `${path}/locations.ini`,
    ];
  const files = fs.readdirSync(path);
  const nonMentionedFiles = [];

  for (let i = 0; i < files.length; i++) {
    if (typeof locations[files[i]] !== 'undefined') continue;
    if (fs.existsSync(`${path}/${files[i]}/locations.ini`)) {
      nonMentionedFiles.push(files[i]);
      continue;
    }
    if (defaultStowLocation) locations[`${path}/${files[i]}`] = defaultStowLocation;
    else locations[`${path}/${files[i]}`] = '$HOME';
  }

  locations = Object.fromEntries(
    Object
      .entries(locations)
      .map(([key, val]) => {
        if (typeof val === 'string') return [key, val.replaceAll('$HOME', process.env.HOME) + '/' + key.split('/').at(-1)];
        return null;
      })
      .filter((x) => {
        return x !== null && (x instanceof Array && !locationsIgnore.includes(x[0]));
      })
  );

  for (let i = 0; i < nonMentionedFiles.length; i++) {
    const dotfileStowDirs = getDotfileStowDirectories(`${path}/${nonMentionedFiles[i]}`);
    if (typeof dotfileStowDirs === 'string') console.error(`Failed to stow ${path}/${nonMentionedFiles[i]}: could not get dotfile stow directories: ${dotfileStowDirs}`);
    else Object.assign(locations, dotfileStowDirs);
  }

  // Fully place the locations
  // For the people trying to read this, this handles the cases when
  // a directory is stowed to a directory that is not a symlink
  // e.g. ~/.dotfiles/dotfiles/vim/.config to ~/.config
  // This iteratively goes through children directories and manually adds their stow paths,
  // removing the parent directory from the locations object
  for (const [dotfilePath, stowPath] of Object.entries(locations)) {
    if (!fs.existsSync(stowPath)
      || (fs.existsSync(stowPath) && fs.lstatSync(stowPath).isSymbolicLink())) continue;
    // Array of queued [dotfilePath, stowPath] whose children should be added manually
    let queue = [[dotfilePath, locations[dotfilePath]]];
    let current = queue[0];
    while (current
      && fs.existsSync(current[1])
      && !fs.lstatSync(current[1]).isSymbolicLink()
      && fs.lstatSync(current[1]).isDirectory()) {
      const children = fs.readdirSync(current[0]);
      for (const child of children) {
        if (!fs.existsSync(`${current[1]}/${child}`)
          || (fs.existsSync(`${current[1]}/${child}`) && fs.lstatSync(`${current[1]}/${child}`).isSymbolicLink()))
          locations[`${current[0]}/${child}`] = `${current[1]}/${child}`;
        else if (fs.lstatSync(`${current[1]}/${child}`).isDirectory())
          queue.push([`${current[0]}/${child}`, `${current[1]}/${child}`]);
      }
      delete locations[current[0]];
      queue.shift();
      current = queue[0];
    }
  }

  return locations;
}
