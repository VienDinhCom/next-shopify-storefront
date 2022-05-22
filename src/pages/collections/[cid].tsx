import { NextPageContext } from 'next';
import { DefaultLayout } from '@app/components/layouts/default-layout/default-layout';
import { ProductService } from '@app/services/product.service';
import { CollectionService } from '@app/services/collection.service';
import { ProductList } from '@app/components/sections/product-list';
import { InfiniteData, useInfiniteQuery } from 'react-query';
import { COLLECTION_PRODUCT_LIST_QUERY } from '@app/constants/query.constant';
import { last } from 'lodash';
import { NextSeo } from 'next-seo';

interface Props {
  handle: string;
  collection: CollectionService.SingleCollection;
  initialData: InfiniteData<ProductService.List>;
}

Page.getInitialProps = async ({ query }: NextPageContext): Promise<Props> => {
  const handle = query.cid as string;
  const collection = await CollectionService.getSingle(handle);

  return {
    handle,
    collection,
    initialData: { pages: [collection.products], pageParams: [null] },
  };
};

export default function Page({ initialData, handle, collection }: Props) {
  const productList = useInfiniteQuery(
    COLLECTION_PRODUCT_LIST_QUERY,
    ({ pageParam }) => CollectionService.getSingle(handle, pageParam).then((c) => c.products),
    {
      initialData,
      getNextPageParam: (lastPage) => {
        if (lastPage.pageInfo.hasNextPage) {
          return last(lastPage.products)?.cursor;
        }
      },
    }
  );

  return (
    <DefaultLayout>
      <NextSeo title={collection.seo.title} description={collection.seo.description} />
      <ProductList products={productList.data?.pages.flatMap(({ products }) => products)!} pagination={productList} />
    </DefaultLayout>
  );
}
