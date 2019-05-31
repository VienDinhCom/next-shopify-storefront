import { gql } from 'apollo-boost';
import { Request, Response } from 'express';
import cookies from 'js-cookie';
import _ from 'lodash';
import { actions } from '../store';
import { shopify } from './apis.service';

export const checkoutFields = gql`
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

const checkoutQuery = gql`
  ${checkoutFields}
  query($checkoutId: ID!) {
    node(id: $checkoutId) {
      ... on Checkout {
        ...checkoutFields
      }
    }
  }
`;

const checkoutCreateMutation = gql`
  mutation {
    checkoutCreate(input: {}) {
      checkout {
        id
      }
    }
  }
`;

const checkoutLineItemsReplaceMutation = gql`
  ${checkoutFields}
  mutation($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
    checkoutLineItemsReplace(checkoutId: $checkoutId, lineItems: $lineItems) {
      checkout {
        ...checkoutFields
      }
    }
  }
`;

export function fetch(req: Request, res: Response) {
  return async dispatch => {
    try {
      dispatch(actions.checkout.request());
      let { checkoutId } = req.cookies;

      if (!checkoutId) {
        const { data } = await shopify.mutate({ mutation: checkoutCreateMutation });
        checkoutId = data.checkoutCreate.checkout.id;
        res.cookie('checkoutId', checkoutId, { maxAge: 1000 * 60 * 60 * 24 * 7 }); // 7 days
      }

      const { data } = await shopify.query({
        query: checkoutQuery,
        variables: {
          checkoutId,
        },
      });

      dispatch(actions.checkout.success({ item: data.node }));
    } catch (error) {
      dispatch(actions.checkout.failure({ error }));
    }
  };
}

interface LineItem {
  variantId: string;
  quantity: number;
}

export function replaceLineItems(lineItems: LineItem[]) {
  return async dispatch => {
    try {
      dispatch(actions.checkout.lineItemsReplaceRequest());
      const checkoutId = cookies.get('checkoutId');

      const { data } = await shopify.mutate({
        mutation: checkoutLineItemsReplaceMutation,
        variables: {
          checkoutId,
          lineItems,
        },
      });

      dispatch(
        actions.checkout.lineItemsReplaceSuccess({
          item: data.checkoutLineItemsReplace.checkout,
        })
      );
    } catch (error) {
      dispatch(actions.checkout.failure({ error }));
    }
  };
}

function getLineItems(lineItems): LineItem[] {
  return lineItems.map(({ node }): LineItem => ({ variantId: node.variant.id, quantity: node.quantity }));
}

export function addLineItem(variantId: string, quantity: number) {
  return async (dispatch, getState) => {
    const lineItems = getLineItems(getState().checkout.item.lineItems.edges);
    const lineItemIndex = _.findIndex(lineItems, { variantId });

    if (lineItemIndex >= 0) {
      lineItems[lineItemIndex].quantity += quantity;
    } else {
      lineItems.push({ variantId, quantity });
    }

    dispatch(replaceLineItems(lineItems));
  };
}

export function updateQuantity(variantId: string, quantity: number) {
  return async (dispatch, getState) => {
    const lineItems = getLineItems(getState().checkout.item.lineItems.edges);
    const lineItemIndex = _.findIndex(lineItems, { variantId });

    lineItems[lineItemIndex].quantity = quantity;

    dispatch(replaceLineItems(lineItems));
  };
}

export function removeLineItem(variantId: string) {
  return async (dispatch, getState) => {
    let lineItems = getLineItems(getState().checkout.item.lineItems.edges);

    lineItems = _.remove(lineItems, (lineItem: LineItem) => lineItem.variantId !== variantId);

    dispatch(replaceLineItems(lineItems));
  };
}
