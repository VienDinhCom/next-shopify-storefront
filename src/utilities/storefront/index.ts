import { Thunder, ZeusScalars } from './zeus';
import { createStorefrontClient } from '@shopify/hydrogen-react';

export const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN as string;
export const publicStorefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN as string;
export const storefrontApiVersion = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION as string;

const { getStorefrontApiUrl, getPublicTokenHeaders } = createStorefrontClient({
  storeDomain,
  storefrontApiVersion,
  publicStorefrontToken,
});

const thunder = Thunder(async (query: string, variables: Record<string, unknown> = {}) => {
  const response = await fetch(getStorefrontApiUrl(), {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers: getPublicTokenHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${body}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors.map((e: Error) => e.message).join('\n'));
  }

  return json.data;
});

const scalars = ZeusScalars({
  URL: {
    encode: (e) => e as string,
    decode: (e) => e as string,
  },
  Decimal: {
    encode: (e) => e as string,
    decode: (e) => e as string,
  },
});

export const storefront = {
  query: thunder('query', {
    scalars,
  }),
  mutation: thunder('mutation', {
    scalars,
  }),
};

export * from './zeus';
