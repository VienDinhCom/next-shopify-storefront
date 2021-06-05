import { getSdk } from './shopify/generated';
import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT;
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const client = new GraphQLClient(endpoint, {
  headers: { 'X-Shopify-Storefront-Access-Token': accessToken },
});

export const ShopifyService = getSdk(client);

export * from './shopify/generated';
