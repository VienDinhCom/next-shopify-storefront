import last from 'lodash/last';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { PRODUCT_LIST_QUERY } from '@app/constants/query.constant';
import { ShopifyService, GetProductListQueryVariables, GetProductListQuery } from './shopify.service';

export namespace ProductService {
  interface GetListInput {
    variables?: GetProductListQueryVariables;
  }

  export function getList(input?: GetListInput) {
    return ShopifyService.getProductList(input?.variables);
  }

  interface UseListInput extends GetListInput {
    options?: UseInfiniteQueryOptions<GetProductListQuery, Error>;
  }

  export function useList(input?: UseListInput) {
    return useInfiniteQuery(
      [PRODUCT_LIST_QUERY, input?.variables],
      ({ pageParam }) => {
        return getList({ variables: { after: pageParam } });
      },
      {
        ...input?.options,
        getNextPageParam: (lastPage) => {
          if (lastPage.products.pageInfo.hasNextPage) {
            return last(lastPage.products.edges)?.cursor;
          }
        },
      }
    );
  }
}

export * from './shopify/generated';
