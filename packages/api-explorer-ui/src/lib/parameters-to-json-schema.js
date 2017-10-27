const getSchema = require('./get-schema');

// https://github.com/OAI/OpenAPI-Specification/blob/4875e02d97048d030de3060185471b9f9443296c/versions/3.0.md#parameterObject
const types = {
  path: 'Path Params',
  query: 'Query Params',
  body: 'Body Params',
  cookie: 'Cookie Params',
  formData: 'Form Data',
  header: 'Headers',
};

module.exports = pathOperation => {
  const hasRequestBody = !!pathOperation.requestBody;
  const hasParameters = !!(pathOperation.parameters && pathOperation.parameters.length !== 0);

  if (!hasParameters && !hasRequestBody) return null;

  function getBodyParam() {
    const schema = getSchema(pathOperation);

    if (!schema) return null;

    return {
      type: 'body',
      label: types.body,
      schema,
    };
  }

  function getOtherParams() {
    return Object.keys(types).map(type => {
      const required = [];
      const parameters = (pathOperation.parameters || []).filter(param => param.in === type);
      if (parameters.length === 0) return null;

      const properties = parameters.reduce((prev, current) => {
        const schema = { type: 'string' };

        if (current.description) schema.description = current.description;

        if (current.schema) {
          if (current.schema.type === 'array') {
            schema.type = 'array';
            schema.items = current.schema.items;
          }

          if (current.schema.default) schema.default = current.schema.default;
          if (current.schema.enum) schema.enum = current.schema.enum;
        }

        prev[current.name] = schema;

        if (current.required) {
          required.push(current.name);
        }

        return prev;
      }, {});

      return {
        type,
        label: types[type],
        schema: {
          type: 'object',
          properties,
          required,
        },
      };
    });
  }

  return [getBodyParam()].concat(...getOtherParams()).filter(Boolean);
};

// Exported for use in oas-to-har for default values object
module.exports.types = types;
