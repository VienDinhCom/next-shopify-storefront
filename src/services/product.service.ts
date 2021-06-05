import last from 'lodash/last';
import { useInfiniteQuery } from 'react-query';
import { shopifyService, GetProductListQueryVariables } from './shopify.service';

export namespace productService {
  export function getList(variables?: GetProductListQueryVariables) {
    return shopifyService.getProductList(variables);
  }

  export function useList(variables?: GetProductListQueryVariables) {
    return useInfiniteQuery(
      ['product-list', variables],
      ({ pageParam }) => {
        return getList({ ...variables, after: pageParam });
      },
      {
        getNextPageParam: (lastPage) => {
          if (lastPage.products.pageInfo.hasNextPage) {
            return last(lastPage.products.edges).cursor;
          }
        },
      }
    );
  }
}
