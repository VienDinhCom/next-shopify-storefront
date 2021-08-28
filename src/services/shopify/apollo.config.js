const path = require('path');
const envKit = require('env-kit');

const endpoint = envKit.get('NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT');
const accessToken = envKit.get('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');

const generated = path.join(__dirname, 'generated.ts');
const documents = path.join(__dirname, 'graphql/**/*.gql');

module.exports = {
  client: {
    service: {
      name: 'Shopify Storefront API',
      url: endpoint,
      headers: { 'X-Shopify-Storefront-Access-Token': accessToken },
    },
    excludes: [generated],
    includes: [documents],
  },
};
