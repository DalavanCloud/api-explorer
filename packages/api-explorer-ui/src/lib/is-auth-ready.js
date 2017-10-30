function isAuthReady(operation, authData) {
  let ready = true;

  const authInputData = authData === undefined ? {} : authData;
  const securitySettings = operation.getSecurity();
  if (!securitySettings) return ready;
  securitySettings.forEach(sec => {
    const key = Object.keys(sec)[0];

    if (!operation.oas.components.securitySchemes[key]) return;
    const security = operation.oas.components.securitySchemes[key];
    const auth = authInputData[key];
    if (security.type === 'http' && security.scheme === 'basic') {
      if (!auth || !auth.user) {
        ready = false;
      }
    }

    if (security.type === 'apiKey') {
      if (!auth) {
        ready = false;
      }
    }

    if (security.type === 'oauth2') {
      if (!auth) {
        ready = false;
      }
    }
  });
  return ready;
}

module.exports = isAuthReady;
