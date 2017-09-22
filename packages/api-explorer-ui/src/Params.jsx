const React = require('react');
const PropTypes = require('prop-types');
const Form = require('react-jsonschema-form').default;
const UpDownWidget = require('react-jsonschema-form/lib/components/widgets/UpDownWidget').default;
const TextWidget = require('react-jsonschema-form/lib/components/widgets/TextWidget').default;

const Oas = require('./lib/Oas');

const { Operation } = Oas;
const parametersToJsonSchema = require('./lib/parameters-to-json-schema');

function Params({ oas, operation, formData, onChange, onSubmit }) {
  const jsonSchema = parametersToJsonSchema(operation, oas);
  return (
    <div className="api-manager">
      {jsonSchema && (
        <Form
          id={`form-${operation.operationId}`}
          schema={jsonSchema}
          widgets={{ int64: UpDownWidget, int32: UpDownWidget, uuid: TextWidget }}
          // eslint-disable-next-line no-console
          onSubmit={form => onSubmit() && console.log('submit', form.formData)}
          formData={formData}
          onChange={form => onChange(form.formData)}
        >
          <button type="submit" style={{ display: 'none' }} />
        </Form>
      )}
    </div>
  );
}

Params.propTypes = {
  oas: PropTypes.instanceOf(Oas).isRequired,
  operation: PropTypes.instanceOf(Operation).isRequired,
  formData: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

module.exports = Params;
