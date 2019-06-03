import { gql } from 'apollo-boost';
import { actions } from '../store';
import { shopify } from './apis.service';
import { ProductsQueryVariables } from '../models'

const productsFragment = gql`
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
              transformedSrc,
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

export const productsQuery = gql`
  ${productsFragment}
  query products($cursor: String, $query: String!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
    products(first: 12, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
      ...products
    }
  }
`;

export function getFirstPage(variables: ProductsQueryVariables) {
  return async dispatch => {
    try {
      dispatch(actions.products.firstPageRequest());

      const { data } = await shopify.query({
        query: productsQuery,
        variables
      });

      dispatch(actions.products.firstPageSuccess({ data: data.products }));
    } catch (error) {
      dispatch(actions.products.firstPageFailure({ error }));
    }
  };
}

export function getNextPage(variables: ProductsQueryVariables) {
  return async dispatch => {
    try {
      dispatch(actions.products.nextPageRequest());

      const { data } = await shopify.query({
        query: productsQuery,
        variables
      });

      dispatch(actions.products.nextPageSuccess({ data: data.products }));
    } catch (error) {
      dispatch(actions.products.nextPageFailure({ error }));
    }
  };
}
