import { GraphQLClient } from 'graphql-request';
import { EnvService } from './env.service';
import { getSdk } from './shopify/generated';

const endpoint = EnvService.get('NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT');
const accessToken = EnvService.get('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');

export const client = new GraphQLClient(endpoint, {
  headers: { 'X-Shopify-Storefront-Access-Token': accessToken },
});

export const ShopifyService = getSdk(client);

export * from './shopify/generated';
