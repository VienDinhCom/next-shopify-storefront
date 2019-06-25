import { gql } from 'apollo-boost';
import { actions } from '../store';
import { shopify } from './apis.service';
import { ProductsQueryVariables } from '../models';

const PRODUCTS_FRAGMENT = gql`
  fragment products on ProductConnection {
    edges {
      node {
        title
        handle
        description
        createdAt
        images(first: 1) {
          edges {
            node {
              transformedSrc
              altText
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
    }
  }
`;

export const PRODUCTS_QUERY = gql`
  ${PRODUCTS_FRAGMENT}
  query products($cursor: String, $query: String!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
    products(first: 12, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
      ...products
    }
  }
`;

export function getFirstPage(variables: ProductsQueryVariables) {
  return async dispatch => {
    try {
      dispatch(actions.products.getFirstPageRequest());

      const { data } = await shopify.query({
        query: PRODUCTS_QUERY,
        variables
      });

      dispatch(actions.products.getFirstPageSuccess({ data: data.products }));
    } catch (error) {
      dispatch(actions.products.getFirstPageFailure({ error }));
    }
  };
}

export function getNextPage(variables: ProductsQueryVariables) {
  return async dispatch => {
    try {
      dispatch(actions.products.getNextPageRequest());

      const { data } = await shopify.query({
        query: PRODUCTS_QUERY,
        variables
      });

      dispatch(actions.products.getNextPageSuccess({ data: data.products }));
    } catch (error) {
      dispatch(actions.products.getNextPageFailure({ error }));
    }
  };
}
