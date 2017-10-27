const ParseResponse = require('../../src/lib/parse-response');
const { Headers } = require('node-fetch');

const req = {
  log: {
    entries: [
      {
        request: {
          headers: [
            {
              name: 'Authorization',
              value: 'Bearer api-key',
            },
          ],
          queryString: [],
          postData: {
            text: '{"category":{},"name":1,"photoUrls":[1]}',
          },
          method: 'POST',
          url: 'http://petstore.swagger.io/v2/pet',
        },
      },
    ],
  },
};
const responseBody = {
  id: 9205436248879918000,
  category: { id: 0 },
  name: '1',
  photoUrls: ['1'],
  tags: [],
};

const headers = new Headers();
headers.set('Content-Disposition', 'application/json');

describe('ParseResponse', () => {
  it('should return result object', () => {
    const res = {
      type: 'cors',
      url: 'http://petstore.swagger.io/v2/pet',
      redirected: false,
      status: 200,
      ok: true,
      statusText: 'OK',
      headers,
    };

    expect(ParseResponse(res, responseBody, req)).toEqual({
      isBinary: false,
      method: 'POST',
      requestHeaders: 'Authorization: Bearer api-key',
      responseHeaders: ['content-disposition: application/json'],
      statusCode: [200, 'OK', 'success'],
      responseBody,
      url: 'http://petstore.swagger.io/v2/pet',
    });
  });
});

describe('ParseResponse', () => {
  it('should return result object and default to 404 if status is not in response', () => {
    const res = {
      type: 'cors',
      url: 'http://petstore.swagger.io/v2/pet',
      redirected: false,
      ok: true,
      statusText: 'OK',
      headers,
    };

    expect(ParseResponse(res, responseBody, req)).toEqual({
      isBinary: false,
      method: 'POST',
      requestHeaders: 'Authorization: Bearer api-key',
      responseHeaders: ['content-disposition: application/json'],
      statusCode: [404, 'Not Found', 'error'],
      responseBody,
      url: 'http://petstore.swagger.io/v2/pet',
    });
  });
});
