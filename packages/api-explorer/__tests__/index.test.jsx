const React = require('react');
const { shallow } = require('enzyme');
const Cookie = require('js-cookie');
const extensions = require('@readme/oas-extensions');
const ApiExplorer = require('../src');

const oas = require('./fixtures/petstore/oas');

const createDocs = require('../lib/create-docs');

const docs = createDocs(oas, 'api-setting');

const languages = ['node', 'curl'];
const props = {
  docs,
  oasFiles: {
    'api-setting': Object.assign({}, oas, {
      [extensions.SAMPLES_LANGUAGES]: languages,
    }),
  },
  flags: {},
  suggestedEdits: false,
};

test('ApiExplorer renders a doc for each', () => {
  const explorer = shallow(<ApiExplorer {...props} />);

  expect(explorer.find('Doc').length).toBe(docs.length);
});

describe('selected language', () => {
  test('should default to curl', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
      />,
    );

    expect(explorer.state('language')).toBe('curl');
  });

  test('should auto-select to the first language of the first oas file', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('language')).toBe(languages[0]);
  });

  describe('#setLanguage()', () => {
    test('should update the language state', () => {
      const explorer = shallow(<ApiExplorer {...props} />);

      explorer.instance().setLanguage('language');
      expect(explorer.state('language')).toBe('language');
      expect(Cookie.get('readme_language')).toBe('language');
    });
  });

  describe('Cookie', () => {
    test('the state of language should be set to Cookie value if provided', () => {
      Cookie.set('readme_language', 'javascript');
      const explorer = shallow(<ApiExplorer {...props} />);

      expect(explorer.state('language')).toBe('javascript');
    });
  });

  test('the state of language should be the first language defined if cookie has not been set', () => {
    Cookie.remove('readme_language');
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('language')).toBe('node');
  });

  test('the state of language should be defaulted to curl if no cookie is present and languages have not been defined', () => {
    Cookie.remove('readme_language');
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
      />,
    );

    expect(explorer.state('language')).toBe('curl');
  });
});

describe('oas', () => {
  const baseDoc = {
    _id: 1,
    title: 'title',
    slug: 'slug',
    type: 'endpoint',
    category: {},
    api: { method: 'get' },
  };

  // Swagger apis and some legacies
  it('should fetch it from `doc.category.apiSetting`', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[Object.assign({}, baseDoc, { category: { apiSetting: 'api-setting' } })]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  // Some other legacy APIs where Endpoints are created in arbitrary categories
  it('should fetch it from `doc.api.apiSetting._id`', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[
          Object.assign({}, baseDoc, {
            api: { method: 'get', apiSetting: { _id: 'api-setting' } },
          }),
        ]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toBe(oas);
  });

  it('should set it to empty object', () => {
    const explorer = shallow(
      <ApiExplorer
        {...props}
        oasFiles={{
          'api-setting': oas,
        }}
        docs={[baseDoc]}
      />,
    );

    expect(explorer.find('Doc').get(0).props.oas).toEqual({});
  });
});

describe('apiKey', () => {
  afterEach(() => Cookie.remove('user_data'));

  it('should read apiKey from `user_data.keys.api_key` cookie', () => {
    const apiKey = '123456';
    Cookie.set('user_data', JSON.stringify({ keys: { api_key: apiKey } }));

    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('apiKey')).toBe(apiKey);
  });

  it('should default to undefined', () => {
    const explorer = shallow(<ApiExplorer {...props} />);

    expect(explorer.state('apiKey')).toBe(undefined);
  });
});
