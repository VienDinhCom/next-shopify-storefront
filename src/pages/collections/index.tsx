import last from 'lodash/last';
import { NextSeo } from 'next-seo';
import { InfiniteData, useInfiniteQuery } from 'react-query';
import { DefaultLayout } from '@app/components/layouts/default-layout/default-layout';

import { COLLECTION_LIST_QUERY } from '@app/constants/query.constant';
import { CollectionService } from '@app/services/collection.service';
import { CollectionList } from '@app/components/sections/collection-list';

interface Props {
  initialData: InfiniteData<CollectionService.CollectionList>;
}

Page.getInitialProps = async (): Promise<Props> => {
  const firstPage = await CollectionService.getCollections();

  return {
    initialData: { pages: [firstPage], pageParams: [null] },
  };
};

export default function Page({ initialData }: Props) {
  const collectionList = useInfiniteQuery(
    COLLECTION_LIST_QUERY,
    ({ pageParam }) => CollectionService.getCollections({ after: pageParam }),
    {
      initialData,
      getNextPageParam: (lastPage) => {
        if (lastPage.pageInfo.hasNextPage) {
          return last(lastPage.collections)?.cursor;
        }
      },
    }
  );

  return (
    <DefaultLayout>
      <NextSeo title="Collections" description="All Collections from Next Shopify Storefront" />
      <CollectionList
        collections={collectionList.data?.pages.flatMap(({ collections }) => collections)!}
        pagination={collectionList}
      />
    </DefaultLayout>
  );
}
