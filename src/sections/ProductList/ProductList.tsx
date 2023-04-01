import { NextImage, NextLink, useState } from '@app/utilities/deps';
import { useAsyncFn } from '@app/utilities/hooks';
import { Button } from '@app/snippets';
import { getProductList, GetProductListOutput } from './ProductList.service';

interface Props {
  productList: GetProductListOutput;
}

export function ProductList(props: Props) {
  const [pages, setPages] = useState([props.productList]);
  const lastPage = pages[pages.length - 1];
  const lastCursor = lastPage.edges[lastPage.edges.length - 1].cursor;
  const hasNextPage = lastPage.pageInfo.hasNextPage;

  const [loader, load] = useAsyncFn(async () => {
    const productList = await getProductList(lastCursor);
    setPages([...pages, productList]);
  }, [lastCursor]);

  return (
    <section>
      <h2 className="sr-only">Products</h2>
      <div className="mb-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {pages
          .flatMap(({ edges }) => edges)
          .map(({ node }) => (
            <NextLink key={node.handle} href={`/products/${node.handle}`} className="group">
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
            </NextLink>
          ))}
      </div>

      {hasNextPage && (
        <div className="text-center">
          <Button color={loader.error ? 'danger' : 'primary'} size="md" onClick={load} disabled={loader.loading}>
            {loader.loading ? 'Loading' : loader.error ? 'Try Again' : 'Load More'}
          </Button>
        </div>
      )}
    </section>
  );
}
