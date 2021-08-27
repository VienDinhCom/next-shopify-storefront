import { useQuery, UseQueryOptions } from 'react-query';
import { CART_QUERY, CART_ITEM_COUNT_QUERY } from '@app/constants/query.constant';
import { ShopifyService, GetCartQueryVariables } from '@app/services/shopify.service';

export namespace CartService {
  interface GetItInput {
    variables: GetCartQueryVariables;
  }

  export function getIt(input: GetItInput) {
    return ShopifyService.getCart(input.variables);
  }

  interface UseItInput extends GetItInput {
    options?: UseQueryOptions;
  }

  export function useIt(input: UseItInput) {
    return useQuery([CART_QUERY, input], () => getIt(input), input.options);
  }
}

export namespace CartService {
  export async function getItemCount() {
    let count: number = 0;
    const checkoutId = localStorage.getItem('checkout-id');

    if (checkoutId) {
      const { node } = await ShopifyService.getCartItemCount({ checkoutId });

      if (node?.__typename === 'Checkout') {
        node?.lineItems.edges.forEach((lineItem) => {
          count += lineItem.node.quantity;
        });
      }
    }

    return count;
  }

  interface UseItemCount {
    options?: UseQueryOptions<number, Error>;
  }

  export function useItemCount(input?: UseItemCount) {
    return useQuery([CART_ITEM_COUNT_QUERY, input], () => getItemCount(), input?.options);
  }
}

export namespace CartService {}
