import { ShopifyService, GetCartQueryVariables, AddCartItemsMutationVariables } from '@app/services/shopify.service';

export namespace CartService {
  const CHECKOUT_ID = 'CHECKOUT_ID';

  export function get(input: GetCartQueryVariables) {
    return ShopifyService.getCart(input);
  }

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

  export async function addItems(lineItems: AddCartItemsMutationVariables['lineItems']) {
    try {
      const checkoutId = localStorage.getItem(CHECKOUT_ID)!;
      await ShopifyService.addCartItems({ checkoutId, lineItems });
    } catch (error) {
      const { checkoutCreate } = await ShopifyService.createCart({ input: { lineItems: [lineItems].flat() } });
      localStorage.setItem(CHECKOUT_ID, checkoutCreate?.checkout?.id!)!;
    }
  }
}
