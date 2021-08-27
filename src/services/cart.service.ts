import { useQuery, UseQueryOptions } from 'react-query';
import { CART_QUERY, CART_ITEM_COUNT_QUERY } from '@app/constants/query.constant';
import { ShopifyService, GetCartQueryVariables, AddCartItemsMutationVariables } from '@app/services/shopify.service';

const CHECKOUT_ID = 'SHOPIFY_CHECKOUT_ID';

export namespace CartService {
  type GetItInput = GetCartQueryVariables;

  export function getIt(input: GetItInput) {
    return ShopifyService.getCart(input);
  }

  interface UseItInput {
    input: GetItInput;
    options?: UseQueryOptions;
  }

  export function useIt(input: UseItInput) {
    return useQuery([CART_QUERY, input], () => getIt(input.input), input.options);
  }
}

export namespace CartService {
  export async function getItemCount() {
    let count: number = 0;
    const checkoutId = localStorage.getItem(CHECKOUT_ID);

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

export namespace CartService {
  type AddItemsInput = AddCartItemsMutationVariables['lineItems'];

  export async function addItems(input: AddItemsInput) {
    try {
      const checkoutId = localStorage.getItem(CHECKOUT_ID)!;

      return ShopifyService.addCartItems({ checkoutId, lineItems: input });
    } catch (error) {
      const { checkoutCreate } = await ShopifyService.createCart({ input: { lineItems: [input].flat() } });

      localStorage.setItem(CHECKOUT_ID, checkoutCreate?.checkout?.id!)!;
    }
  }
}
