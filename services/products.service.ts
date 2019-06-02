import { gql } from 'apollo-boost';
import { actions } from '../store';
import { shopify } from './apis.service';
import { ProductsQueryVariables } from '../types'

const productsFragment = gql`
  fragment products on ProductConnection {
    edges {
      node {
        title
        handle
        description
        createdAt
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
    products(first: 5, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
      ...products
    }
  }
`;

export function getFirstPage({ query, sortKey, reverse }: ProductsQueryVariables) {
  return async dispatch => {
    try {
      dispatch(actions.products.firstPageRequest());

      const { data } = await shopify.query({
        query: productsQuery,
        variables: {
          query: query || '',
          sortKey: sortKey ? sortKey.toUpperCase() : 'BEST_SELLING',
          reverse,
        },
      });


      const items: ProductConnection = data.products;

      dispatch(actions.products.firstPageSuccess({ items }));
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


      const items: ProductConnection = data.products;

      dispatch(actions.products.nextPageSuccess({ items }));
    } catch (error) {
      dispatch(actions.products.nextPageFailure({ error }));
    }
  };
}
