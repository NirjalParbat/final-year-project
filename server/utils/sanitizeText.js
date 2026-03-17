export const sanitizeText = (value, { maxLength = 4000 } = {}) => {
  if (typeof value !== 'string') return value;

  const cleaned = value
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Drop null/control chars except tab/newline/carriage return
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Collapse consecutive whitespace
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength);
  }

  return cleaned;
};

export const sanitizeStringArray = (arr, options) => {
  if (!Array.isArray(arr)) return arr;
  return arr
    .map((item) => sanitizeText(item, options))
    .filter((item) => typeof item === 'string' && item.length > 0);
};
