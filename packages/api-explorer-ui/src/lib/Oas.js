const getPathOperation = require('./get-path-operation');

class Operation {
  constructor(oas, path, method, operation) {
    Object.assign(this, operation);
    this.oas = oas;
    this.path = path;
    this.method = method;
  }

  hasAuth() {
    const security = this.getSecurity();
    return !!(security && security.length);
  }

  getSecurity() {
    return this.security || this.oas.security;
  }

  prepareSecurity() {
    const securityRequirements = this.getSecurity();

    return securityRequirements
      .map(requirement => {
        let keys;
        try {
          keys = Object.keys(requirement);
        } catch (e) {
          return false;
        }

        return keys.map(key => {
          let security;
          try {
            security = this.oas.components.securitySchemes[key];
          } catch (e) {
            return false;
          }

          if (!security) return false;
          let type = security.type;
          if (security.type === 'http' && security.scheme === 'basic') {
            type = 'Basic';
          } else if (security.type === 'oauth2') {
            type = 'OAuth2';
          } else if (security.type === 'apiKey' && security.in === 'query') {
            type = 'Query';
          } else if (security.type === 'apiKey' && security.in === 'header') {
            type = 'Header';
          }

          security._key = key;

          return { type, security };
        });
      })
      .filter(Boolean)
      .reduce((prev, securities) => {
        securities.forEach(security => {
          if (!prev[security.type]) prev[security.type] = [];
          prev[security.type].push(security.security);
        });
        return prev;
      }, {});
  }
}

class Oas {
  constructor(oas) {
    Object.assign(this, oas);
  }

  operation(path, method) {
    const operation = getPathOperation(this, { swagger: { path }, api: { method } });
    return new Operation(this, path, method, operation);
  }
}

module.exports = Oas;
module.exports.Operation = Operation;
