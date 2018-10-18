const React = require('react');
const remark = require('remark');
const reactRenderer = require('remark-react');
const breaks = require('remark-breaks');
const sanitize = require('hast-util-sanitize/lib/github.json');
const Variable = require('@readme/variable');

const variableParser = require('./variable-parser');
const gemojiParser = require('./gemoji-parser');

const table = require('./components/Table');
const heading = require('./components/Heading');
const anchor = require('./components/Anchor');
const code = require('./components/Code');

// This is for checklists in <li>
sanitize.tagNames.push('input');
sanitize.ancestors.input = ['li'];

const GlossaryItem = require('./GlossaryItem');
const GlossaryTermsContext = require('./contexts/GlossaryTerms');

module.exports = function markdown(text, opts = {}) {
  if (!text) return null;

  return remark()
    .use(variableParser.sanitize(sanitize))
    .use(!opts.correctnewlines ? breaks : () => {})
    .use(gemojiParser.sanitize(sanitize))
    .use(reactRenderer, {
      sanitize,
      remarkReactComponents: {
        'readme-variable': Variable,
        'readme-glossary-item': GlossaryItem,
        table: table(sanitize),
        h1: heading('h1', sanitize),
        h2: heading('h2', sanitize),
        h3: heading('h3', sanitize),
        h4: heading('h4', sanitize),
        h5: heading('h5', sanitize),
        h6: heading('h6', sanitize),
        a: anchor(sanitize),
        code: code(sanitize),
        // Remove enclosing <div>
        // https://github.com/mapbox/remark-react/issues/54
        div: props => React.createElement(React.Fragment, props),
      },
    })
    .processSync(text).contents;
};

module.exports.GlossaryTermsContext = GlossaryTermsContext;
