import fs from 'node:fs';

/**
 * @param {string} cwd Current working directory
 * @returns {string|null} Directory if found; otherwise, null
 */
export function getBaseDotfileDirectory(cwd, depth = 0) {
  if (cwd.endsWith('/')) cwd = cwd.slice(0, -1);
  if (fs.existsSync(`${cwd}/operandum.ini`)) return cwd;
  if (depth > 5) return null;
  const parentDir = cwd.slice(0, cwd.lastIndexOf('/'));
  if ((parentDir.length === cwd.length || parentDir.length === cwd.length + 1)
    && parentDir === cwd.replaceAll('/', '')) return null;
  return getBaseDotfileDirectory(parentDir, depth + 1);
}
