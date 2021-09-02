import last from 'lodash/last';
import { NextSeo } from 'next-seo';
import { InfiniteData, useInfiniteQuery } from 'react-query';
import { ProductList } from '@app/components/sections/product-list';
import { DefaultLayout } from '@app/components/layouts/default-layout/default-layout';

import { PRODUCT_LIST_QUERY } from '@app/constants/query.constant';
import { ProductService } from '@app/services/product.service';

interface Props {
  initialData: InfiniteData<ProductService.List>;
}

Page.getInitialProps = async (): Promise<Props> => {
  const firstPage = await ProductService.getList();

  return {
    initialData: { pages: [firstPage], pageParams: [null] },
  };
};

export default function Page({ initialData }: Props) {
  const productList = useInfiniteQuery(
    PRODUCT_LIST_QUERY,
    ({ pageParam }) => ProductService.getList({ after: pageParam }),
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
      <NextSeo title="Products" description="All Products from Next Shopify Storefront" />
      <ProductList products={productList.data?.pages.flatMap(({ products }) => products)!} pagination={productList} />
    </DefaultLayout>
  );
}
