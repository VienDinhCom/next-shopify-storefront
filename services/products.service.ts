import { gql } from 'apollo-boost';
import { actions } from '../store';
import { shopify } from './apis.service';
import { ProductsQueryVariables } from '../types'

const productConnectionFields = gql`
  fragment productConnectionFields on ProductConnection {
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
  ${productConnectionFields}
  query products($cursor: String, $query: String!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
    products(first: 5, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
      ...productConnectionFields
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

      const { hasNextPage } = data.products.pageInfo;
      const items = data.products.edges.map(({ node, cursor }): object => ({ ...node, cursor }));

      dispatch(actions.products.firstPageSuccess({ items, hasNextPage }));
    } catch (error) {
      dispatch(actions.products.firstPageFailure({ error }));
    }
  };
}

export function getNextPage({ cursor, query, sortKey, reverse }: ProductsQueryVariables) {
  return async dispatch => {
    try {
      dispatch(actions.products.nextPageRequest());

      const { data } = await shopify.query({
        query: productsQuery,
        variables: {
          cursor,
          query,
          sortKey: sortKey ? sortKey.toUpperCase() : 'BEST_SELLING',
          reverse,
        },
      });

      const { hasNextPage } = data.products.pageInfo;
      const items = data.products.edges.map(edge => ({ ...edge.node, cursor: edge.cursor }));

      dispatch(actions.products.nextPageSuccess({ items, hasNextPage }));
    } catch (error) {
      dispatch(actions.products.nextPageFailure({ error }));
    }
  };
}
