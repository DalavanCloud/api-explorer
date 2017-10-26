global.fetch = require('node-fetch');

global.Request = fetch.Request;

const React = require('react');
const { shallow, mount } = require('enzyme');
const Doc = require('../src/Doc');
const oas = require('./fixtures/petstore/circular-oas.json');

Doc.prototype.onSubmit = jest.fn(Doc.prototype.onSubmit);

const props = {
  doc: {
    title: 'Title',
    slug: 'slug',
    type: 'endpoint',
    swagger: { path: '/pet/{petId}' },
    api: { method: 'get' },
    formData: { path: { petId: '1' }, auth: { api_key: '' } },
    onSubmit: () => {},
  },
  oas,
  setLanguage: () => {},
  language: 'node',
};

function assertDocElements(component, doc) {
  expect(component.find(`#page-${doc.slug}`).length).toBe(1);
  expect(component.find('a.anchor-page-title').length).toBe(1);
  expect(component.find('h2').text()).toBe(doc.title);
}

test('should output a div', () => {
  const doc = shallow(<Doc {...props} />);

  assertDocElements(doc, props.doc);
  expect(doc.find('.hub-api').length).toBe(1);
  expect(doc.find('PathUrl').length).toBe(1);
  expect(doc.find('CodeSample').length).toBe(1);
  expect(doc.find('Params').length).toBe(1);
  expect(doc.find('Content').length).toBe(1);
});

test('should work without a doc.swagger/doc.path/oas', () => {
  const doc = { title: 'title', slug: 'slug', type: 'basic' };
  const docComponent = shallow(<Doc doc={doc} setLanguage={() => {}} language="node" />);

  assertDocElements(docComponent, doc);
  expect(docComponent.find('.hub-api').length).toBe(0);
  expect(docComponent.find('Content').length).toBe(1);
});

describe('state.dirty', () => {
  test('should default to false', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('dirty')).toBe(false);
  });

  test('should switch to true on form change', () => {
    const doc = shallow(<Doc {...props} />);
    doc.instance().onChange({ a: 1 });

    expect(doc.state('dirty')).toBe(true);
  });
});

describe('onSubmit', () => {
  test('should display authentication warning if auth is required for endpoint', () => {
    jest.useFakeTimers();

    const doc = mount(<Doc {...props} />);

    doc.instance().onSubmit();
    expect(doc.state('showAuthBox')).toBe(true);

    jest.runAllTimers();

    expect(doc.state('needsAuth')).toBe(true);
  });

  test('should make request on Submit', () => {
    const props2 = {
      doc: {
        title: 'Title',
        slug: 'slug',
        type: 'endpoint',
        swagger: { path: '/pet' },
        api: { method: 'post' },
        formData: {
          body: {
            name: '1',
            photoUrls: ['1'],
          },
        },
        onSubmit: () => {},
      },
      oas,
      setLanguage: () => {},
    };
    // Doc.prototype.onSubmit = jest.fn(Doc.prototype.onSubmit);
    //

    window.fetch = jest.fn(req => Promise.resolve({ test: 1 }));

    const doc = mount(<Doc {...props2} />);
    // doc.instance().onSubmit();
    // doc.instance().onChange({ auth: { api_key: 'api-key' } });
    // doc.instance().onSubmit();

    // expect(doc.state('loading')).toBe(true);
    expect(doc.state('showAuthBox')).toBe(false);
    expect(doc.state('needsAuth')).toBe(false);

    expect(Doc.prototype.onSubmit).toBeCalled();
    // expect(doc.state('result')).toEqual({
    //   init: true,
    //   isBinary: false,
    //   method: 'POST',
    //   requestHeaders: 'Authorization : Bearer api-key',
    //   responseHeaders: 'content-disposition,application/json',
    //   statusCode: [200, 'OK', 'success'],
    //   responseBody: {
    //     id: 9205436248879918000,
    //     category: { id: 0 },
    //     name: '1',
    //     photoUrls: ['1'],
    //     tags: [],
    //   },
    //   url: 'http://petstore.swagger.io/v2/pet',
    // });
  });
});

describe('toggleAuth', () => {
  test('toggleAuth should change state of showAuthBox', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('showAuthBox')).toBe(false);

    doc.instance().toggleAuth({ preventDefault() {} });

    expect(doc.state('showAuthBox')).toBe(true);

    doc.instance().toggleAuth({ preventDefault() {} });

    expect(doc.state('showAuthBox')).toBe(false);
  });
});

describe('state.loading', () => {
  test('should default to false', () => {
    const doc = shallow(<Doc {...props} />);

    expect(doc.state('loading')).toBe(false);
  });
});
