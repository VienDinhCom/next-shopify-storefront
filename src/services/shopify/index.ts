import envKit from 'env-kit';
import { GraphQLClient } from 'graphql-request';

import { getSdk } from './generated';

const endpoint = envKit.get("SHOPIFY_API_ENDPOINT") + "/graphql.json";
const accessToken = envKit.get('SHOPIFY_ACCESS_TOKEN') as string;

const client = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Access-Token': accessToken,
  },
});

export const shopify = getSdk(client);

export * from './generated';
