import { Fragment } from 'react';
import { InfiniteData } from 'react-query';
import { productService, GetProductListQuery } from '@app/services/product.service';
import { InfiniteButton } from '@app/components/buttons/infinite-button';

interface Props {
  initialData: InfiniteData<GetProductListQuery>;
}

export default function Page({ initialData }: Props) {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = productService.useList({
    options: { initialData, refetchOnMount: false },
  });

  console.log({ isFetching, isFetchingNextPage });

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
      <InfiniteButton fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
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
