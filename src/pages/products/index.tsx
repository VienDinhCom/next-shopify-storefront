import { InfiniteData } from 'react-query';
import { ProductList } from '@app/components/lists/product-list';
import { InfiniteButton } from '@app/components/buttons/infinite-button';
import { ProductService, GetProductListQuery } from '@app/services/product.service';

interface Props {
  initialData: InfiniteData<GetProductListQuery>;
}

Page.getInitialProps = async (): Promise<Props> => {
  const firstPage = await ProductService.getList({});

  return {
    initialData: { pages: [firstPage], pageParams: [undefined] },
  };
};

export default function Page({ initialData }: Props) {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = ProductService.useList({
    options: { initialData, refetchOnMount: false },
  });

  return status === 'loading' ? (
    <p>Loading...</p>
  ) : status === 'error' ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      <ProductList pages={data.pages} />
      <InfiniteButton fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
      <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
    </>
  );
}
