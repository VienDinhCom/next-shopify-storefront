import { storefront } from '@app/utilities/storefront';
import { truncate } from 'lodash';
import { ProductPrice, AddToCartButton, ProductProvider } from '@shopify/hydrogen-react';
import { NextImage, DataProps, invariant, useVariantSelector, formatTitle } from '@app/utilities/deps';
import { Button } from '@app/snippets';

export async function fetchProductSingleSection(handle: string) {
  const { productByHandle } = await storefront.query({
    productByHandle: [
      { handle },
      {
        title: true,
        description: [{ truncateAt: 256 }, true],
        seo: {
          title: true,
          description: true,
        },
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
        options: [
          { first: 250 },
          {
            id: true,
            name: true,
            values: true,
          },
        ],
        variants: [
          { first: 250 },
          {
            nodes: {
              id: true,
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

  const { seo, title, description } = productByHandle;

  return {
    ...productByHandle,
    seo: {
      title: formatTitle(seo.title || title),
      description: seo.description || truncate(description, { length: 256 }),
    },
  };
}

export function ProductSingleSection(props: DataProps<typeof fetchProductSingleSection>) {
  const { variantId, options, selectOption } = useVariantSelector(props.data);

  return (
    <ProductProvider data={props.data}>
      <section>
        <div className="flex flex-col rounded-lg shadow-sm md:flex-row md:space-x-8">
          <div className="md:basis-6/12 ">
            <div className="h-full w-full overflow-hidden rounded-lg bg-gray-200">
              <NextImage
                src={props.data.images.nodes[0].url}
                alt={props.data.images.nodes[0].altText || ''}
                width={props.data.images.nodes[0].width}
                height={props.data.images.nodes[0].height}
                className="min-h-[600px] w-full object-cover object-center"
              />
            </div>
          </div>

          <div className="md:basis-6/12">
            <div className="mt-4 pt-5 md:pt-10">
              <h2 className="sr-only">Product information</h2>

              <h1 className="mb-5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{props.data.title}</h1>

              <p className="mb-5 text-base text-gray-900">{props.data.description}</p>

              <div className="mb-5 text-3xl tracking-tight text-gray-900">
                <ProductPrice data={props.data}></ProductPrice>
              </div>

              <div className="mb-2">
                {options.map(({ name, values }) => (
                  <div className="mb-3" key={name}>
                    <div className="flex items-center justify-between">
                      <h3 className="mb-1 text-lg font-medium text-gray-900">{name}</h3>
                    </div>

                    {values.map(({ value, selected, disabled }) => {
                      return (
                        <Button
                          className="mr-1"
                          color={selected ? 'primary' : 'dark'}
                          size="sm"
                          key={value}
                          disabled={disabled}
                          onClick={() => selectOption(name, value)}
                        >
                          {value}
                        </Button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <AddToCartButton
                variantId={variantId}
                className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 p-3 text-base font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-700"
              >
                Add to Cart
              </AddToCartButton>
            </div>
          </div>
        </div>
      </section>
    </ProductProvider>
  );
}
