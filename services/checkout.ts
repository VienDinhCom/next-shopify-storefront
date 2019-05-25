import _ from 'lodash';
import cookie from 'js-cookie';
import { gql } from 'apollo-boost';
import { actions } from '../store';
import { shopify } from './apis';

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

async function create() {
  let checkoutId = cookie.get('checkoutId');

  if (checkoutId) return checkoutId;

  const { data } = await shopify.mutate({ mutation: checkoutCreateMutation });

  checkoutId = data.checkoutCreate.checkout.id;

  if (checkoutId) cookie.set('checkoutId', checkoutId, { expires: 7 });

  return checkoutId;
}

export function fetch() {
  return async (dispatch: Function) => {
    try {
      dispatch(actions.checkout.request());

      const checkoutId = await create();

      const { data } = await shopify.query({
        query: checkoutQuery,
        variables: {
          checkoutId
        }
      });

      dispatch(actions.checkout.success({ item: data.node }));
    } catch (error) {
      dispatch(actions.checkout.failure({ error }));
    }
  };
}

interface ILineItem {
  variantId: string;
  quantity: number;
}

export function replaceLineItems(lineItems: ILineItem[]) {
  return async (dispatch: Function) => {
    try {
      dispatch(actions.checkout.lineItemsReplaceRequest());
      const checkoutId = await create();

      const { data } = await shopify.mutate({
        mutation: checkoutLineItemsReplaceMutation,
        variables: {
          checkoutId,
          lineItems
        }
      });

      dispatch(actions.checkout.lineItemsReplaceSuccess({ item: data.checkoutLineItemsReplace.checkout }));
    } catch (error) {
      dispatch(actions.checkout.failure({ error }));
    }
  };
}

function getLineItems(lineItems: Object[]): ILineItem[] {
  return lineItems.map(({ node }: any) => {
    return { variantId: node.variant.id, quantity: node.quantity };
  });
}

export function addLineItem(variantId: string, quantity: number) {
  return async (dispatch: Function, getState: Function) => {
    const lineItems = getLineItems(getState().cart.data.lineItems.edges);
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
  return async (dispatch: Function, getState: Function) => {
    const lineItems = getLineItems(getState().cart.data.lineItems.edges);
    const lineItemIndex = _.findIndex(lineItems, { variantId });

    lineItems[lineItemIndex].quantity = quantity;

    dispatch(replaceLineItems(lineItems));
  };
}

export function removeLineItem(variantId: string) {
  return async (dispatch: Function, getState: Function) => {
    let lineItems = getLineItems(getState().cart.data.lineItems.edges);

    lineItems = _.remove(lineItems, lineItem => {
      return lineItem.variantId !== variantId;
    });

    dispatch(replaceLineItems(lineItems));
  };
}
