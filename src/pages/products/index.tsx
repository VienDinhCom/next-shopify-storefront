import { storefront } from '@app/utilities/storefront';
import { AsyncReturnType } from '@app/utilities/types';
import { GetServerSideProps, NextImage } from '@app/utilities/deps';
import { DefaultLayout } from '@app/layouts/DefaultLayout';

async function getProducts() {
  const { products } = await storefront.query({
    products: [
      { first: 12 },
      {
        edges: {
          node: {
            handle: true,
            title: true,
            priceRange: {
              minVariantPrice: {
                amount: true,
                currencyCode: true,
              },
            },
            featuredImage: {
              url: [{ transform: { maxWidth: 500 } }, true],
              altText: true,
              width: true,
              height: true,
            },
          },
        },
      },
    ],
  });

  return products;
}

interface Props {
  products: AsyncReturnType<typeof getProducts>;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  return {
    props: {
      products: await getProducts(),
    },
  };
};

export default function Page(props: Props) {
  return (
    <DefaultLayout>
      <h2 className="sr-only">Products</h2>

      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {props.products.edges.map(({ node }) => (
          <a key={node.handle} href={`/products/${node.handle}`} className="group">
            <div className="w-full overflow-hidden rounded-lg bg-gray-200">
              <NextImage
                src={node.featuredImage!.url}
                alt={node.featuredImage!.altText || ''}
                height={node.featuredImage!.height}
                width={node.featuredImage!.width}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <h3 className="mt-4 text-sm text-gray-700">{node.title}</h3>

            <p className="mt-1 text-lg font-medium text-gray-900">
              {node.priceRange.minVariantPrice.currencyCode} {node.priceRange.minVariantPrice.amount}
            </p>
          </a>
        ))}
      </div>
    </DefaultLayout>
  );
}
