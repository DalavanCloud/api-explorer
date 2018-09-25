const React = require('react');
const swagger2openapi = require('swagger2openapi');
const PropTypes = require('prop-types');
const extensions = require('../../packages/oas-extensions/');

const createDocs = require('../../packages/api-explorer/lib/create-docs');

const ApiExplorer = require('../../packages/api-explorer/src');
const ApiList = require('./ApiList');

require('../../example/swagger-files/types.json');
require('../../packages/api-explorer/api-explorer.css');

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.textarea = React.createRef();
    this.state = { status: [], oas: {}, docs: [] };
    this.fetchSwagger = this.fetchSwagger.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.convertSwagger = this.convertSwagger.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }
  updateStatus(status, next) {
    this.setState(prev => ({ status: [...prev.status, status] }), next);
  }
  fetchSwagger(url) {
    this.updateStatus('Fetching swagger file', () => {
      fetch(url)
        .then(res => res.json())
        .then((json) => {
          if (json.swagger) return this.convertSwagger(json);

          return this.dereference(json);
        });
    });
  }
  dereference(oas) {
    this.createDocs(oas);
    this.setState({ oas });
    this.updateStatus('Done!', () => {
      setTimeout(() => {
        this.setState({ status: [] });
      }, 1000);
    });
  }

  onSubmit(event) {
    event.preventDefault();

    const node = this.textarea.current;
    let json;
    try {
      json = JSON.parse(node.value);
    } catch (e) {
      return alert('This is not valid JSON!'); // eslint-disable-line no-alert
    }
    return this.dereference(json);
  }

  convertSwagger(swagger) {
    this.updateStatus('Converting swagger file to OAS 3', () => {
      swagger2openapi.convertObj(swagger, {})
        .then(({ openapi }) => this.dereference(openapi));
    });
  }
  createDocs(oas) {
    this.setState({ docs: createDocs(oas, 'api-setting') });
  }
  render() {
    return (
      <div>
        <div className="api-list-header">
          <ApiList fetchSwagger={this.fetchSwagger} />
          <pre>{this.state.status.join('\n')}</pre>
        </div>
        <form onSubmit={this.onSubmit} className="input-container">
          <label htmlFor="json-text">
            Input arbitrary json
            <br />
            <textarea id="json-text" rows={5} ref={this.textarea} />
          </label>
          <br />
          <input type="submit" />
        </form>
        {
          this.state.status.length === 0 && (
            <ApiExplorer
              // // To test the top level error boundary, uncomment this
              // docs={[null, null]}
              docs={this.state.docs}
              oasFiles={{
                'api-setting': Object.assign(extensions.defaults, this.state.oas),
              }}
              flags={{ correctnewlines: false }}
              // Uncomment this in for column layout
              // appearance={{ referenceLayout: 'column' }}
              appearance={{ referenceLayout: 'row' }}
              suggestedEdits
              oauth={this.props.oauth}
              variables={{
                user: { keys: [{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }] },
                defaults: [],
              }}
              glossaryTerms={[{ term: 'apiKey', definition: 'This is a definition' }]}
            />
          )
        }
      </div>
    );
  }
}

Demo.propTypes = {
  oauth: PropTypes.bool,
};

Demo.defaultProps = {
  oauth: false,
};
module.exports = Demo;
