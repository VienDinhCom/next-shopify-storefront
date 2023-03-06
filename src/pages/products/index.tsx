import { storefront } from '@app/utilities/storefront';
import { AsyncReturnType } from '@app/utilities/types';
import { GetServerSideProps, NextImage, useState } from '@app/utilities/deps';
import { DefaultLayout } from '@app/layouts/DefaultLayout';
import { useAsyncFn } from '@app/utilities/hooks';

async function getProducts(cursor?: string) {
  const { products } = await storefront.query({
    products: [
      { first: 12, after: cursor || null },
      {
        pageInfo: {
          hasNextPage: true,
        },
        edges: {
          cursor: true,
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

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return {
    props: {
      products: await getProducts(),
    },
  };
};

export default function Page(props: Props) {
  const [pages, setPages] = useState([props.products]);
  const lastPage = pages[pages.length - 1];
  const lastCursor = lastPage.edges[lastPage.edges.length - 1].cursor;
  const hasNextPage = lastPage.pageInfo.hasNextPage;

  const [loader, load] = useAsyncFn(async () => {
    const products = await getProducts(lastCursor);
    setPages([...pages, products]);
  }, [lastCursor]);

  return (
    <DefaultLayout>
      <h2 className="sr-only">Products</h2>

      <div className="mb-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {pages
          .flatMap(({ edges }) => edges)
          .map(({ node }) => (
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

      {hasNextPage && <button onClick={load}>Load More</button>}
    </DefaultLayout>
  );
}
