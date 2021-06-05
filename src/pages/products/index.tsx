import { Fragment } from 'react';
import { productService, GetProductListQuery, InfiniteData } from '@app/services/product.service';

interface Props {
  initialData: InfiniteData<GetProductListQuery>;
}

export default function Page({ initialData }: Props) {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = productService.useList({
    options: { initialData, refetchOnMount: false },
  });

  return status === 'loading' ? (
    <p>Loading...</p>
  ) : status === 'error' ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      <ul>
        {data.pages.map((group, i) => (
          <Fragment key={i}>
            {group.products.edges.map(({ node }) => {
              return <li key={node.id}>{node.title}</li>;
            })}
          </Fragment>
        ))}
      </ul>
      <div>
        <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load More' : 'Nothing more to load'}
        </button>
      </div>
      <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
    </>
  );
}

Page.getInitialProps = async (): Promise<Props> => {
  const firstPage = await productService.getList({});

  return {
    initialData: {
      pages: [firstPage],
      pageParams: [undefined],
    },
  };
};
