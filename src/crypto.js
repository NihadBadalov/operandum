const crypto = (await import('crypto')).default;

/**
 * @param {string} text Text to encrypt
 * @param {string} password User password
 * @returns {string} Encrypted text
 */
export function encryptAES256(text, password) {
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return 'OPERANDUM;' + iv.toString('hex') + ';' + encrypted;
}

/**
 * @param {string} text Text to decryt
 * @param {string} password User password
 * @returns {string} Decrypted text
 */
export function decryptAES256(text, password) {
  if (!text.startsWith('OPERANDUM;'))
    throw new Error('Error: in decryptAES256(): Invalid encrypted text; Text was not encrypted by operandum or is corrupted');

  const parts = text.split(';');
  if (parts.length !== 3)
    throw new Error('Error: in decryptAES256(): Invalid encrypted text format; Expected IV part');

  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(parts[2], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
