const config = require('./graphql.config.json'); // eslint-disable-line

const shopify = config.generates['typings/shopify.types.ts'].schema[0];
const url = Object.keys(shopify)[0];
const { headers } = shopify[url];

module.exports = {
  client: {
    service: {
      name: 'shopify',
      url,
      headers
    },
    excludes: ['**/node_modules/**/*'],
    includes: ['**/*.{ts,tsx}'],
  }
};
