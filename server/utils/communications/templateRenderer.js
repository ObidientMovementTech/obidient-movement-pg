const PLACEHOLDER_REGEX = /{{\s*([a-zA-Z0-9_\.]+)\s*}}/g;

const getValue = (data, path) => {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return acc[key];
    }
    return undefined;
  }, data);
};

export const renderTemplate = (template = '', data = {}) => {
  if (!template) return '';

  return template.replace(PLACEHOLDER_REGEX, (_, token) => {
    const value = getValue(data, token);
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });
};

export default renderTemplate;
