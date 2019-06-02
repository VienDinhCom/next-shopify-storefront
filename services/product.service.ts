import { gql } from 'apollo-boost';
import { actions } from '../store';
import { shopify } from './apis.service';
import { ProductQueryVariables } from '../types'

const productFragment = gql`
  fragment product on Product {
    title
    description
    images(first: 1) {
      edges {
        node {
          originalSrc
        }
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

export const productQuery = gql`
  ${productFragment}
  query product($handle: String!) {
    productByHandle(handle: $handle) {
      ...product
    }
  }
`;

export function fetch({ handle }: ProductQueryVariables) {
  return async dispatch => {
    try {
      dispatch(actions.product.request());

      const { data } = await shopify.query({
        query: productQuery,
        variables: {
          handle,
        },
      });

      const item = data.productByHandle;

      dispatch(actions.product.success({ item }));
    } catch (error) {
      dispatch(actions.product.failure({ error }));
    }
  };
}
