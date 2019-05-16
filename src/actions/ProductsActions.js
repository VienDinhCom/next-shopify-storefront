import { createAction } from 'redux-starter-kit';
import { gql } from 'apollo-boost';
import { types } from '../constants';
import shopify from '../services/shopify';

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

export const getFirstPageOfProductsRequest = createAction(types.GET_FIRST_PAGE_OF_PRODUCTS_REQUEST);
export const getFirstPageOfProductsFailure = createAction(types.GET_FIRST_PAGE_OF_PRODUCTS_FAILURE);
export const getFirstPageOfProductsSuccess = createAction(types.GET_FIRST_PAGE_OF_PRODUCTS_SUCCESS);

export function getFristPageOfProducts(args: Object) {
  return async (dispatch: Function) => {
    try {
      dispatch(getFirstPageOfProductsRequest());

      const query = gql`
        ${productConnectionFields}

        query($query: String!, $sortKey: ProductSortKeys, $reverse: Boolean) {
          products(first: 5, query: $query, sortKey: $sortKey, reverse: $reverse) {
            ...productConnectionFields
          }
        }
      `;

      const response = await shopify.query({
        query,
        variables: {
          query: args.query || '',
          sortKey: args.sortKey ? args.sortKey.toUpperCase() : 'BEST_SELLING',
          reverse: args.reverse === 'true' ? true : false,
        },
      });

      const { hasNextPage } = response.data.products.pageInfo;
      const data = response.data.products.edges.map(({ node, cursor }) => ({ ...node, cursor }));

      dispatch(getFirstPageOfProductsSuccess({ data, hasNextPage }));
    } catch (error) {
      dispatch(getFirstPageOfProductsFailure({ error }));
    }
  };
}

export const getNextPageOfProductsRequest = createAction(types.GET_NEXT_PAGE_OF_PRODUCTS_REQUEST);
export const getNextPageOfProductsFailure = createAction(types.GET_NEXT_PAGE_OF_PRODUCTS_FAILURE);
export const getNextPageOfProductsSuccess = createAction(types.GET_NEXT_PAGE_OF_PRODUCTS_SUCCESS);

export function getNextPageOfProducts(args: Object) {
  return async (dispatch: Function) => {
    try {
      dispatch(getNextPageOfProductsRequest());

      const query = gql`
        ${productConnectionFields}

        query($cursor: String!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
          products(first: 3, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
            ...productConnectionFields
          }
        }
      `;

      const response = await shopify.query({
        query,
        variables: {
          cursor: args.cursor,
          query: args.query || '',
          sortKey: args.sortKey ? args.sortKey.toUpperCase() : 'BEST_SELLING',
          reverse: args.reverse === 'true' ? true : false,
        },
      });

      const { hasNextPage } = response.data.products.pageInfo;
      const data = response.data.products.edges.map(({ node, cursor }) => ({ ...node, cursor }));

      dispatch(getNextPageOfProductsSuccess({ data, hasNextPage }));
    } catch (error) {
      dispatch(getNextPageOfProductsFailure({ error }));
    }
  };
}
