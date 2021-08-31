import nookies from 'nookies';
import { NextPageContext } from 'next';
import { ShopifyService, CheckoutLineItemInput, CheckoutLineItemUpdateInput, CurrencyCode } from '@app/services/shopify.service';

const CHECKOUT_ID = 'CHECKOUT_ID';
export namespace CartService {
  export interface CartItem {
    id: string;
    title: string;
    quantity: number;
    variant: {
      id: string;
      title: string;
      url: string;
      price: {
        amount: number;
        currencyCode: CurrencyCode;
      };
      image: {
        src: string;
        alt: string;
      };
    };
  }

  export type Cart = {
    items: CartItem[];
  };

  export async function getCart(context?: NextPageContext): Promise<Cart | undefined> {
    const checkoutId = nookies.get(context, CHECKOUT_ID).CHECKOUT_ID;

    if (checkoutId) {
      const { node } = await ShopifyService.getCart({ checkoutId });

      if (node?.__typename === 'Checkout') {
        const items: CartItem[] = node.lineItems.edges.map(({ node }) => {
          const item: CartItem = {
            id: node.id,
            title: node.title,
            quantity: node.quantity,
            variant: {
              id: node.variant?.id!,
              title: node.variant?.title!,
              url: `/products/${node.variant?.product.handle}`,
              price: {
                amount: Number(node.variant?.priceV2?.amount),
                currencyCode: node.variant?.priceV2?.currencyCode!,
              },
              image: {
                src: node.variant?.image?.transformedSrc!,
                alt: node.variant?.image?.altText || '',
              },
            },
          };

          return item;
        });

        return {
          items,
        };
      }
    }
  }

  export async function getItemCount(context?: NextPageContext): Promise<number> {
    let count: number = 0;
    const checkoutId = nookies.get(context, CHECKOUT_ID).CHECKOUT_ID;

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

  export async function addItem(
    lineItem: CheckoutLineItemInput,
    context?: NextPageContext
  ): Promise<void> {
    try {
      const checkoutId = nookies.get(context, CHECKOUT_ID).CHECKOUT_ID;
      await ShopifyService.addCartItem({ checkoutId, lineItem });
    } catch (error) {
      const { checkoutCreate } = await ShopifyService.createCart({ input: { lineItems: [lineItem] } });
      nookies.set(context, CHECKOUT_ID, checkoutCreate?.checkout?.id!, { maxAge: 30 * 24 * 60 * 60 });
    }
  }

  export async function updateItem(
    lineItem: CheckoutLineItemUpdateInput,
    context?: NextPageContext
  ): Promise<void> {
    const checkoutId = nookies.get(context, CHECKOUT_ID).CHECKOUT_ID;
    await ShopifyService.updateCartItem({ checkoutId, lineItem });
  }

  export async function removeItem(lineItemId: string, context?: NextPageContext): Promise<void> {
    const checkoutId = nookies.get(context, CHECKOUT_ID).CHECKOUT_ID;
    await ShopifyService.removeCartItem({ checkoutId, lineItemId });
  }
}
