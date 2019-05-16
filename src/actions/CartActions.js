import { createAction } from 'redux-starter-kit';
import { gql } from 'apollo-boost';
import { types } from '../constants';
import shopify from '../services/shopify';

const checkoutFields = gql`
  fragment checkoutFields on Checkout {
    id
    webUrl
    subtotalPriceV2 {
      amount
      currencyCode
    }
    totalTaxV2 {
      amount
      currencyCode
    }
    totalPriceV2 {
      amount
      currencyCode
    }
    lineItems(first: 250) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          title
          variant {
            id
            title
            image {
              transformedSrc
            }
            priceV2 {
              amount
              currencyCode
            }
          }
          quantity
        }
      }
    }
  }
`;

export const addVariantToCartRequest = createAction(types.ADD_VARIANT_TO_CART_REQUEST);
export const addVariantToCartFailure = createAction(types.ADD_VARIANT_TO_CART_FAILURE);
export const addVariantToCartSuccess = createAction(types.ADD_VARIANT_TO_CART_SUCCESS);

async function checkoutCreate() {
  const mutation = gql`
    mutation {
      checkoutCreate(input: {}) {
        checkout {
          id
        }
      }
    }
  `;

  const { data } = await shopify.mutate({ mutation });

  return data.checkoutCreate.checkout.id;
}

export function addVariantToCart(args: Object) {
  return async (dispatch: Function, getState: Function) => {
    try {
      dispatch(addVariantToCartRequest());
      const checkout = getState().cart.data;
      let checkoutId = checkout.id;
      let lineItems = checkout.lineItems;

      if (!checkoutId) checkoutId = await checkoutCreate();

      if (lineItems) {
        lineItems = lineItems.edges.map(({ node }) => ({
          quantity: node.quantity,
          variantId: node.variant.id,
        }));
      } else {
        lineItems = [];
      }

      lineItems.push({
        variantId: args.variantId,
        quantity: args.quantity,
      });

      const mutation = gql`
        ${checkoutFields}

        mutation($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
          checkoutLineItemsReplace(checkoutId: $checkoutId, lineItems: $lineItems) {
            checkout {
              ...checkoutFields
            }
          }
        }
      `;

      const { data } = await shopify.mutate({
        mutation,
        variables: {
          checkoutId,
          lineItems,
        },
      });

      dispatch(addVariantToCartSuccess({ data: data.checkoutLineItemsReplace.checkout }));
    } catch (error) {
      dispatch(addVariantToCartFailure({ error }));
    }
  };
}
