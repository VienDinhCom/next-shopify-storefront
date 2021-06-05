import last from 'lodash/last';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { ShopifyService, GetProductListQueryVariables, GetProductListQuery } from './shopify.service';

export namespace ProductService {
  interface GetListInput {
    variables?: GetProductListQueryVariables;
  }

  export function getList({ variables }: GetListInput) {
    return ShopifyService.getProductList(variables);
  }

  interface UseListInput extends GetListInput {
    options?: UseInfiniteQueryOptions<GetProductListQuery, Error>;
  }

  export function useList({ variables, options }: UseListInput) {
    return useInfiniteQuery(
      ['product-list', variables],
      ({ pageParam }) => {
        return getList({ variables: { after: pageParam } });
      },
      {
        ...options,
        getNextPageParam: (lastPage) => {
          if (lastPage.products.pageInfo.hasNextPage) {
            return last(lastPage.products.edges).cursor;
          }
        },
      }
    );
  }
}

export * from './shopify/generated';
