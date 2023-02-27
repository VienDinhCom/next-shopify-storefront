import { Thunder } from './zeus';

const endpoint = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT as string;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;

const thunder = Thunder(async (query: string, variables: Record<string, unknown> = {}) => {
  const response = await fetch(endpoint, {
    body: JSON.stringify({ query, variables }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
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
  query: thunder('query'),
  mutation: thunder('mutation'),
};

export * from './zeus';
