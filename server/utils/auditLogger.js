const SENSITIVE_KEY_PATTERN = /(password|token|secret|authorization|cookie|api[_-]?key)/i;

const sanitizeMeta = (value) => {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMeta(item));
  }

  if (typeof value === 'object') {
    const output = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        output[key] = '[REDACTED]';
      } else {
        output[key] = sanitizeMeta(val);
      }
    }
    return output;
  }

  if (typeof value === 'string' && value.length > 512) {
    return `${value.slice(0, 512)}...[truncated]`;
  }

  return value;
};

export const logAuditEvent = (event, meta = {}, level = 'info') => {
  const payload = {
    timestamp: new Date().toISOString(),
    service: 'ghumfir-api',
    event,
    level,
    meta: sanitizeMeta(meta),
  };

  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.info(line);
  }
};
