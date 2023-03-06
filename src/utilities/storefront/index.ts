import { Thunder } from './zeus';

const apiEndpoint = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT as string;
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;

const thunder = Thunder(async (query: string, variables: Record<string, unknown> = {}) => {
  const response = await fetch(apiEndpoint, {
    body: JSON.stringify({ query, variables }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': accessToken,
    },
  });

  if (!response.ok) {
    return new Promise((_resolve, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (_error) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }

  const { data } = await response.json();

  return data;
});

export const storefront = {
  query: thunder('query', {
    scalars: {
      URL: {
        encode: (e) => e as string,
        decode: (e) => e as string,
      },
      Decimal: {
        encode: (e) => `${e}`,
        decode: (e) => parseFloat(e as string),
      },
    },
  }),
  mutation: thunder('mutation'),
};

export * from './zeus';
