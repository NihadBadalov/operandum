import fs from 'node:fs';

/**
 * @param {string} iniString The INI string to parse
 * @returns {{[key: string]: string}} INI file contents as an object
 */
export function parseINIString(iniString) {
  const lines = iniString.split('\n');
  const result = {};
  let currentSection = result;

  let line = '';
  for (let i = 0; i < lines.length; i++) {
    line = lines[i]?.trim();

    if (!line || line.startsWith(';')) {
      continue;
    }

    if (line.startsWith('[')) {
      currentSection = line.slice(1, -1);
      result[currentSection] = {};
      currentSection = result[currentSection];
    } else {
      const [key, value] = line.split('=');
      currentSection[key.trim()] = value.trim();
    }
  }

  return result;
};

/**
 * @param {string} filePath File path
 * @returns {{[key: string]: any}|null} INI file contents as an object; null if the file doesn't exist
 */
export function parseINIFile(filePath) {
  if (!filePath.endsWith('.ini'))
    throw Error('Error: in parseINIFile: Invalid file path - file does not have an .INI');
  if (!fs.existsSync(filePath)) return null;
  const contents = fs.readFileSync(filePath, 'utf8');
  return parseINIString(contents);
}

/**
 * @description Writes an INI object to a file, alphabetically sorted
 * @param {string} filePath File path
 * @param {{[key: string]: any}} obj INI object to write to the file
 */
export function writeToINIFile(filePath, obj) {
  if (!filePath.endsWith('.ini'))
    throw Error('Error: in writeToINIFile: Invalid file path - file does not have an .INI');

  // Write main key-value pairs
  let iniString = '; operandum - INI config file\n';
  let queue = [];
  const sectionQueue = [];
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'object') {
      sectionQueue.push(key);
      continue;
    }
    queue.push(`\n${key}=${val}`);
  }

  queue.sort();
  for (const item of queue) {
    iniString += item;
  }

  // Write key-value pairs in sections
  sectionQueue.sort();
  for (const sectionName of sectionQueue) {
    iniString += `\n\n[${sectionName}]`;
    queue = [];
    for (const [key, val] of Object.entries(obj[sectionName])) {
      queue.push(`\n${key}=${val}`);
    }
    queue.sort();
    for (const item of queue) {
      iniString += item;
    }
  }

  fs.writeFileSync(filePath, iniString);
}
