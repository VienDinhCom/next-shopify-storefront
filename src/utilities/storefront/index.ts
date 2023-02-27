import { Chain } from './zeus';

const endpoint = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT as string;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;

const chain = Chain(endpoint, { headers: { 'X-Shopify-Storefront-Access-Token': token } });

export const storefront = {
  query: chain('query'),
  mutation: chain('mutation'),
};

export * from './zeus';
