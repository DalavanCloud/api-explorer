const React = require('react');
const PropTypes = require('prop-types');
const fetchHar = require('fetch-har');
const oasToHar = require('./lib/oas-to-har');
const isAuthReady = require('./lib/is-auth-ready');
const extensions = require('@readme/oas-extensions');
const Waypoint = require('react-waypoint');

const { Fragment } = React;

const PathUrl = require('./PathUrl');
const Params = require('./Params');
const CodeSample = require('./CodeSample');
const Response = require('./Response');
const ResponseSchema = require('./ResponseSchema');

const Oas = require('./lib/Oas');
const showCode = require('./lib/show-code');
const parseResponse = require('./lib/parse-response');
const Content = require('./block-types/Content');

class Doc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      dirty: false,
      loading: false,
      showAuthBox: false,
      needsAuth: false,
      result: null,
      showEndpoint: false,
    };
    this.onChange = this.onChange.bind(this);
    this.oas = new Oas(this.props.oas);
    this.onSubmit = this.onSubmit.bind(this);
    this.toggleAuth = this.toggleAuth.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.waypointEntered = this.waypointEntered.bind(this);

    this.setApiKey();
  }

  onChange(formData) {
    this.setState(previousState => {
      return {
        formData: Object.assign({}, previousState.formData, formData),
        dirty: true,
      };
    });
  }
  onSubmit() {
    const operation = this.getOperation();

    if (!isAuthReady(operation, this.state.formData.auth)) {
      this.setState({ showAuthBox: true });
      setTimeout(() => {
        this.authInput.focus();
        this.setState({ needsAuth: true });
      }, 600);
      return false;
    }

    this.setState({ loading: true, showAuthBox: false, needsAuth: false });

    const har = oasToHar(this.oas, operation, this.state.formData, { proxyUrl: true });

    return fetchHar(har).then(async res => {
      this.setState({
        loading: false,
        result: await parseResponse(har, res),
      });
    });
  }

  setApiKey() {
    if (!this.props.apiKey) return;

    const operation = this.getOperation();

    if (!operation) return;

    try {
      const firstSecurity = this.operation.getSecurity()[0];

      this.state.formData.auth = { [Object.keys(firstSecurity)[0]]: this.props.apiKey };
    } catch (e) {
      console.error('There was a problem setting the api key', e); // eslint-disable-line no-console
    }
  }

  getOperation() {
    if (this.operation) return this.operation;

    const { doc } = this.props;
    const operation = doc.swagger ? this.oas.operation(doc.swagger.path, doc.api.method) : null;
    this.operation = operation;
    return operation;
  }

  toggleAuth(e) {
    e.preventDefault();
    this.setState({ showAuthBox: !this.state.showAuthBox });
  }

  hideResults() {
    this.setState({ result: null });
  }

  waypointEntered() {
    this.setState({ showEndpoint: true });
  }

  shouldShowCode() {
    return showCode(this.oas, this.getOperation());
  }

  themeMain(doc) {
    return (
      <Fragment>
        {doc.type === 'endpoint' && (
          <div className="hub-api">
            {this.renderPathUrl()}

            {this.shouldShowCode() && (
              <div className="hub-reference-section hub-reference-section-code">
                <div className="hub-reference-left">{this.renderCodeSample()}</div>
                {this.renderResponse()}
              </div>
            )}

            <div className="hub-reference-section">
              <div className="hub-reference-left">{this.renderParams()}</div>
              <div className="hub-reference-right switcher">{this.renderResponseSchema()}</div>
            </div>
          </div>
        )}

        <Content body={doc.body} flags={this.props.flags} isThreeColumn />
      </Fragment>
    );
  }

  themeStripe(doc) {
    return (
      <div className="hub-api">
        <div className="hub-reference-section">
          <Fragment>
            <div className="hub-reference-left">
              {doc.type === 'endpoint' && (
                <Fragment>
                  {this.renderPathUrl()}
                  {this.renderParams()}
                </Fragment>
              )}
              <Content body={doc.body} flags={this.props.flags} isThreeColumn="left" />
            </div>

            <div className="hub-reference-right">
              {doc.type === 'endpoint' &&
              this.shouldShowCode() && (
                <div className="hub-reference-section-code">
                  {this.renderCodeSample()}
                  <div className="hub-reference-results tabber-parent">{this.renderResponse()}</div>
                </div>
              )}
              <Content body={doc.body} flags={this.props.flags} isThreeColumn="right" />
            </div>
          </Fragment>
        </div>
      </div>
    );
  }

  renderCodeSample() {
    return (
      <CodeSample
        oas={this.oas}
        setLanguage={this.props.setLanguage}
        operation={this.getOperation()}
        formData={this.state.formData}
        language={this.props.language}
      />
    );
  }

  renderResponse() {
    return (
      <Response
        result={this.state.result}
        oas={this.oas}
        operation={this.getOperation()}
        oauth={this.props.oauth}
        hideResults={this.hideResults}
      />
    );
  }

  renderResponseSchema() {
    const operation = this.getOperation();

    return operation.responses && <ResponseSchema operation={this.getOperation()} />;
  }

  renderEndpoint() {
    const { doc } = this.props;

    if (this.props.flags.stripe) {
      return this.themeStripe(doc);
    }

    return this.themeMain(doc);
  }

  renderParams() {
    return (
      <Params
        oas={this.oas}
        operation={this.getOperation()}
        formData={this.state.formData}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
      />
    );
  }

  renderPathUrl() {
    return (
      <PathUrl
        oas={this.oas}
        operation={this.getOperation()}
        dirty={this.state.dirty}
        loading={this.state.loading}
        onChange={this.onChange}
        showAuthBox={this.state.showAuthBox}
        needsAuth={this.state.needsAuth}
        oauth={this.props.oauth}
        toggleAuth={this.toggleAuth}
        onSubmit={this.onSubmit}
        authInputRef={el => (this.authInput = el)}
        apiKey={this.props.apiKey}
      />
    );
  }

  render() {
    const { doc } = this.props;
    const oas = this.oas;

    return (
      <div className="hub-reference" id={`page-${doc.slug}`}>
        {
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a className="anchor-page-title" id={doc.slug} />
        }

        <div className="hub-reference-section hub-reference-section-top">
          <div className="hub-reference-left">
            <header>
              {this.props.suggestedEdits && (
                // eslint-disable-next-line jsx-a11y/href-no-hash
                <a className="hub-reference-edit pull-right" href={`reference-edit/${doc.slug}`}>
                  <i className="icon icon-register" />
                  Suggest Edits
                </a>
              )}
              <h2>{doc.title}</h2>
              {doc.excerpt && (
                <div className="excerpt">
                  {
                    // eslint-disable-next-line react/no-danger
                    <p dangerouslySetInnerHTML={{ __html: doc.excerpt }} />
                  }
                </div>
              )}
            </header>
          </div>
          <div className="hub-reference-right">&nbsp;</div>
        </div>

        <Waypoint onEnter={this.waypointEntered} fireOnRapidScroll={false} bottomOffset="-1%">
          {this.state.showEndpoint && this.renderEndpoint()}
        </Waypoint>

        {
          // TODO maybe we dont need to do this with a hidden input now
          // cos we can just pass it around?
        }
        <input
          type="hidden"
          id={`swagger-${extensions.SEND_DEFAULTS}`}
          value={oas[extensions.SEND_DEFAULTS]}
        />
      </div>
    );
  }
}

module.exports = Doc;

Doc.propTypes = {
  doc: PropTypes.shape({
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    slug: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    api: PropTypes.shape({
      method: PropTypes.string.isRequired,
    }),
    swagger: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }),
  }).isRequired,
  oas: PropTypes.shape({}),
  setLanguage: PropTypes.func.isRequired,
  flags: PropTypes.shape({
    stripe: PropTypes.bool,
  }),
  language: PropTypes.string.isRequired,
  oauth: PropTypes.bool.isRequired,
  suggestedEdits: PropTypes.bool.isRequired,
  apiKey: PropTypes.string.isRequired,
};

Doc.defaultProps = {
  oas: {},
  flags: {
    stripe: false,
  },
};
