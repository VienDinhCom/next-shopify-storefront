import { storefront } from '@app/utilities/storefront';
import { ProductPrice, AddToCartButton, ProductProvider } from '@shopify/hydrogen-react';
import { NextImage, DataProps, invariant, useVariantSelector } from '@app/utilities/deps';

export async function fetchProductSingleSection(handle: string) {
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

  return productByHandle;
}

export function ProductSingleSection(props: DataProps<typeof fetchProductSingleSection>) {
  const { selectedVariantId, options, selectOption } = useVariantSelector(props.data);

  console.log({ selectedVariantId });

  return (
    <ProductProvider data={props.data}>
      <section>
        <div className="flex space-x-8 rounded-lg  shadow-sm">
          <div className="basis-6/12">
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

          <div className="basis-6/12">
            {/* Options */}
            <div className="mt-4 pt-8 lg:row-span-3 lg:mt-0">
              <h2 className="sr-only">Product information</h2>
              <h1 className="mb-5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{props.data.title}</h1>
              <div className="text-3xl tracking-tight text-gray-900">
                <ProductPrice data={props.data}></ProductPrice>
              </div>

              <div className="mt-10">
                <div className="mt-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      Size guide
                    </a>
                  </div>

                  <br />

                  <div>
                    {options.map(({ name, values }) => (
                      <div key={name}>
                        <h3>{name}</h3>

                        {values.map(({ value, selected, disabled }) => {
                          return (
                            <button
                              key={value}
                              disabled={disabled}
                              className="m-3 border"
                              style={{
                                color: selected ? 'red' : 'black',
                              }}
                              onClick={() => selectOption(name, value)}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <AddToCartButton
                  variantId={selectedVariantId}
                  className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 p-3 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-black"
                >
                  Add to Cart
                </AddToCartButton>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h3 className="sr-only">Description</h3>

          <div className="space-y-6">
            <p className="text-base text-gray-900">{props.data.description}</p>
          </div>
        </section>
      </section>
    </ProductProvider>
  );
}
