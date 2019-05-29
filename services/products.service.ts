import { gql } from 'apollo-boost';
import { actions } from '../store';
import { shopify } from './apis.service';

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

interface Args {
  cursor?: string;
  query: string;
  sortKey: string;
  reverse: boolean;
}

export function getFirstPage({ query, sortKey, reverse }: Args): Function {
  return async (dispatch: Function): Promise<void> => {
    try {
      dispatch(actions.products.firstPageRequest());

      const { data } = await shopify.query({
        query: firstPageQuery,
        variables: {
          query: query || '',
          sortKey: sortKey ? sortKey.toUpperCase() : 'BEST_SELLING',
          reverse
        }
      });

      const { hasNextPage } = data.products.pageInfo;
      const items = data.products.edges.map(({ node, cursor }: any): object => ({ ...node, cursor }));

      dispatch(actions.products.firstPageSuccess({ items, hasNextPage }));
    } catch (error) {
      dispatch(actions.products.firstPageFailure({ error }));
    }
  };
}

export function getNextPage({ cursor, query, sortKey, reverse }: Args): Function {
  return async (dispatch: Function): Promise<void> => {
    try {
      dispatch(actions.products.nextPageRequest());

      const { data } = await shopify.query({
        query: nextPageQuery,
        variables: {
          cursor,
          query,
          sortKey: sortKey ? sortKey.toUpperCase() : 'BEST_SELLING',
          reverse
        }
      });

      const { hasNextPage } = data.products.pageInfo;
      const items = data.products.edges.map((edge: any): object => ({ ...edge.node, cursor: edge.cursor }));

      dispatch(actions.products.nextPageSuccess({ items, hasNextPage }));
    } catch (error) {
      dispatch(actions.products.nextPageFailure({ error }));
    }
  };
}
