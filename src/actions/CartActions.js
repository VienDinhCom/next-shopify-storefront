import { createAction } from 'redux-starter-kit';
import cookie from 'js-cookie';
import _ from 'lodash';
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
          id
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

async function getCheckoutId() {
  let checkoutId = cookie.get('checkoutId');

  if (checkoutId) return checkoutId;

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

  checkoutId = data.checkoutCreate.checkout.id;

  cookie.set('checkoutId', checkoutId, { expires: 7 });

  return checkoutId;
}

export const getCartRequest = createAction(types.GET_CART_REQUEST);
export const getCartFailure = createAction(types.GET_CART_FAILURE);
export const getCartSuccess = createAction(types.GET_CART_SUCCESS);

export function getCart() {
  return async (dispatch: Function, getState: Function) => {
    try {
      dispatch(getCartRequest());

      const checkoutId = await getCheckoutId();

      const query = gql`
        ${checkoutFields}

        query($checkoutId: ID!) {
          node(id: $checkoutId) {
            ... on Checkout {
              ...checkoutFields
            }
          }
        }
      `;

      const { data } = await shopify.query({
        query,
        variables: {
          checkoutId: checkoutId,
        },
      });

      dispatch(getCartSuccess({ data: data.node }));
    } catch (error) {
      dispatch(getCartFailure({ error }));
    }
  };
}

export const changeLineItemsRequest = createAction(types.CHANGE_LINE_ITEMS_REQUEST);
export const changeLineItemsFailure = createAction(types.CHANGE_LINE_ITEMS_FAILURE);
export const changeLineItemsSuccess = createAction(types.CHANGE_LINE_ITEMS_SUCCESS);

function changeLineItems(lineItems: Object[]) {
  return async (dispatch: Function) => {
    try {
      dispatch(changeLineItemsRequest());
      let checkoutId = await getCheckoutId();

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

      dispatch(changeLineItemsSuccess({ data: data.checkoutLineItemsReplace.checkout }));
    } catch (error) {
      dispatch(changeLineItemsFailure({ error }));
    }
  };
}

function getLineItems(lineItems) {
  return lineItems.map(({ node }) => {
    return { variantId: node.variant.id, quantity: node.quantity };
  });
}

export function addVariantToCart(variantId: string, quantity: number) {
  return async (dispatch: Function, getState: Function) => {
    const lineItems = getLineItems(getState().cart.data.lineItems.edges);
    const lineItemIndex = _.findIndex(lineItems, { variantId });

    if (lineItemIndex >= 0) {
      lineItems[lineItemIndex].quantity += quantity;
    } else {
      lineItems.push({ variantId, quantity });
    }

    dispatch(changeLineItems(lineItems));
  };
}

export function updateQuantityOfVariant(variantId: string, quantity: number) {
  return async (dispatch: Function, getState: Function) => {
    const lineItems = getLineItems(getState().cart.data.lineItems.edges);
    const lineItemIndex = _.findIndex(lineItems, { variantId });

    lineItems[lineItemIndex].quantity = parseInt(quantity || 1);

    dispatch(changeLineItems(lineItems));
  };
}

export function removeVariantOutOfCart(variantId: string) {
  return async (dispatch: Function, getState: Function) => {
    let lineItems = getLineItems(getState().cart.data.lineItems.edges);

    lineItems = _.remove(lineItems, function(lineItem) {
      return lineItem.variantId !== variantId;
    });

    dispatch(changeLineItems(lineItems));
  };
}
