function harValue(type, value) {
  if (!value.value) return undefined;
  return { type, value };
}

module.exports = function configureSecurity(oas, values, scheme) {
  if (!scheme) return {};

  if (Object.keys(values.auth || {}).length === 0) return undefined;

  if (!oas.components.securitySchemes[scheme]) return undefined;
  const security = oas.components.securitySchemes[scheme];

  if (security.type === 'http') {
    if (security.scheme === 'basic') {
      // Return with no header if user and password are blank
      if (!values.auth[scheme].user && !values.auth[scheme].password) return false;

      return harValue('headers', {
        name: 'Authorization',
        value: `Basic ${new Buffer(
          `${values.auth[scheme].user}:${values.auth[scheme].password}`,
        ).toString('base64')}`,
      });
    }

    if (security.scheme === 'bearer') {
      if (!values.auth[scheme]) return false;

      return harValue('headers', {
        name: 'Authorization',
        value: `Bearer ${values.auth[scheme]}`,
      });
    }
  }

  if (security.type === 'apiKey') {
    if (security.in === 'query') {
      return harValue('queryString', {
        name: security.name,
        value: values.auth[scheme],
      });
    }
    if (security.in === 'header') {
      const header = {
        name: security.name,
        value: values.auth[scheme],
      };

      if (security['x-bearer-format']) {
        // Uppercase: token -> Token
        const bearerFormat =
          security['x-bearer-format'].charAt(0).toUpperCase() +
          security['x-bearer-format'].slice(1);
        header.name = security.name;
        header.value = `${bearerFormat} ${header.value}`;
      }
      return harValue('headers', header);
    }
  }

  if (security.type === 'oauth2') {
    if (!values.auth[scheme]) return false;

    return harValue('headers', {
      name: 'Authorization',
      value: `Bearer ${values.auth[scheme]}`,
    });
  }

  return undefined;
};
