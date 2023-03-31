import { storefront } from '@app/utils/storefront';
import { invariant } from '@app/utils/deps';
import { AsyncReturnType } from '@app/utils/types';

import fs from 'fs';

export async function getProductSingle(handle: string) {
  const hello = fs.readFileSync('/home/maxvien/setup.sh', 'utf-8');
  console.log(hello);

  const { productByHandle } = await storefront.query({
    productByHandle: [
      { handle },
      {
        title: true,
        description: [{ truncateAt: null }, true],
        priceRange: {
          minVariantPrice: {
            amount: true,
            currencyCode: true,
          },
        },
        images: [
          { first: 250 },
          {
            nodes: {
              id: true,
              url: [
                {
                  transform: {
                    maxHeight: 600,
                  },
                },
                true,
              ],
              altText: true,
              width: true,
              height: true,
            },
          },
        ],
        variants: [
          { first: 250 },
          {
            nodes: {
              availableForSale: true,
              priceV2: {
                amount: true,
                currencyCode: true,
              },
              selectedOptions: {
                name: true,
                value: true,
              },
              image: {
                id: true,
              },
            },
          },
        ],
      },
    ],
  });

  invariant(productByHandle, `Product not found: ${handle}`);

  return productByHandle;
}

export type GetProductSingleOutput = AsyncReturnType<typeof getProductSingle>;
