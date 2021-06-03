import envKit from 'env-kit';
import { GraphQLClient } from 'graphql-request';

import { getSdk } from './generated';

const endpoint = envKit.get('SHOPIFY_STOREFRONT_API_ENDPOINT');
const accessToken = envKit.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

const client = new GraphQLClient(endpoint, {
  headers: { 'X-Shopify-Access-Token': accessToken },
});

export const shopify = getSdk(client);

export * from './generated';
