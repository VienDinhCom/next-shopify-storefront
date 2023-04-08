import { storefront } from '@app/utilities/storefront';
import { RadioGroup } from '@headlessui/react';
import { ProductPrice, AddToCartButton, ProductProvider } from '@shopify/hydrogen-react';
import { NextImage, useState, DataProps, invariant, useEffect } from '@app/utilities/deps';
import { uniqBy } from 'lodash';
import { VariantSelector } from '@app/snippets';

const product = {
  colors: [
    { name: 'White', class: 'bg-white', selectedClass: 'ring-gray-400' },
    { name: 'Gray', class: 'bg-gray-200', selectedClass: 'ring-gray-400' },
    { name: 'Black', class: 'bg-gray-900', selectedClass: 'ring-gray-900' },
  ],
  sizes: [
    { name: 'XXS', inStock: false },
    { name: 'XS', inStock: true },
    { name: 'S', inStock: true },
    { name: 'M', inStock: true },
    { name: 'L', inStock: true },
    { name: 'XL', inStock: true },
    { name: '2XL', inStock: true },
    { name: '3XL', inStock: true },
  ],
};

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

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
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2]);

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

                  <VariantSelector variants={props.data.variants}></VariantSelector>

                  <RadioGroup value={selectedSize} onChange={setSelectedSize} className="mt-4">
                    <RadioGroup.Label className="sr-only"> Choose a size </RadioGroup.Label>
                    <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
                      {product.sizes.map((size) => (
                        <RadioGroup.Option
                          key={size.name}
                          value={size}
                          disabled={!size.inStock}
                          className={({ active }) =>
                            classNames(
                              size.inStock
                                ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                                : 'cursor-not-allowed bg-gray-50 text-gray-200',
                              active ? 'ring-2 ring-primary-500' : '',
                              'group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 sm:py-6'
                            )
                          }
                        >
                          {({ active, checked }) => (
                            <>
                              <RadioGroup.Label as="span">{size.name}</RadioGroup.Label>
                              {size.inStock ? (
                                <span
                                  className={classNames(
                                    active ? 'border' : 'border-2',
                                    checked ? 'border-primary-500' : 'border-transparent',
                                    'pointer-events-none absolute -inset-px rounded-md'
                                  )}
                                  aria-hidden="true"
                                />
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                                >
                                  <svg
                                    className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                    stroke="currentColor"
                                  >
                                    <line x1={0} y1={100} x2={100} y2={0} vectorEffect="non-scaling-stroke" />
                                  </svg>
                                </span>
                              )}
                            </>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <AddToCartButton
                  variantId={props.data.variants.nodes[0].id}
                  className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 p-3 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
