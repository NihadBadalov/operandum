/**
 * @param {string} iniString The INI string to analyze
 * @returns {object} INI file contents as an object
 */
export function analyzeINIString(iniString) {
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
 * @returns {object} INI file contents as an object
 */
export function analyzeINIFile(filePath) {
  const contents = fs.readFileSync(filePath, 'utf8');
  return analyzeINIString(contents);
}
