import { gql } from 'apollo-boost';
import { actions } from '../store';
import { shopify } from './api';

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

export const firstPageQuery = gql`
  ${productConnectionFields}
  query($query: String!, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: 5, query: $query, sortKey: $sortKey, reverse: $reverse) {
      ...productConnectionFields
    }
  }
`;

export const nextPageQuery = gql`
  ${productConnectionFields}
  query($cursor: String!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: 3, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
      ...productConnectionFields
    }
  }
`;

interface IArgs {
  cursor: string;
  query: string;
  sortKey: string;
  reverse: boolean;
}

export function getFirstPage({ query, sortKey, reverse }: IArgs) {
  return async (dispatch: Function) => {
    try {
      dispatch(actions.products.firstPageRequest());

      const response = await shopify.query({
        query: firstPageQuery,
        variables: {
          query: query || '',
          sortKey: sortKey ? sortKey.toUpperCase() : 'BEST_SELLING',
          reverse
        }
      });

      const { hasNextPage } = response.data.products.pageInfo;
      const items = response.data.products.edges.map(({ node, cursor }: any) => ({ ...node, cursor }));

      dispatch(actions.products.firstPageSuccess({ items, hasNextPage }));
    } catch (error) {
      dispatch(actions.products.firstPageFailure({ error }));
    }
  };
}

export function getNextPage({ cursor, query, sortKey, reverse }: IArgs) {
  return async (dispatch: Function) => {
    try {
      dispatch(actions.products.nextPageRequest());

      const response = await shopify.query({
        query: nextPageQuery,
        variables: {
          cursor,
          query: query || '',
          sortKey: sortKey ? sortKey.toUpperCase() : 'BEST_SELLING',
          reverse
        }
      });

      const { hasNextPage } = response.data.products.pageInfo;
      const items = response.data.products.edges.map((edge: any) => ({ ...edge.node, cursor: edge.cursor }));

      dispatch(actions.products.nextPageSuccess({ items, hasNextPage }));
    } catch (error) {
      dispatch(actions.products.nextPageFailure({ error }));
    }
  };
}
