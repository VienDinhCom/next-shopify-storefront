import { createAction } from 'redux-starter-kit';
import { gql } from 'apollo-boost';
import { types } from '../constants';
import shopify from '../services/shopify';

export const getFirstPageOfProductsRequest = createAction(types.GET_FIRST_PAGE_OF_PRODUCTS_REQUEST);

export const getFirstPageOfProductsFailure = createAction(types.GET_FIRST_PAGE_OF_PRODUCTS_FAILURE);

export const getFirstPageOfProductsSuccess = createAction(types.GET_FIRST_PAGE_OF_PRODUCTS_SUCCESS);

export function getFristPageOfProducts(opts: Object) {
  return async (dispatch: Function) => {
    try {
      dispatch(getFirstPageOfProductsRequest());

      const query = gql`
        query product($query: String!, $sortKey: ProductSortKeys, $reverse: Boolean) {
          products(first: 5, query: $query, sortKey: $sortKey, reverse: $reverse) {
            edges {
              node {
                title
                handle
                description
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      `;

      const response = await shopify.query({
        query,
        variables: {
          query: opts.query || '',
          sortKey: opts.sortKey ? opts.sortKey.toUpperCase() : 'BEST_SELLING',
          reverse: opts.reverse === 'true' ? true : false,
        },
      });

      const { hasNextPage } = response.data.products.pageInfo;
      const data = response.data.products.edges.map(({ node, cursor }) => ({
        title: node.title,
        handle: node.handle,
        description: node.description,
        cursor,
      }));

      dispatch(getFirstPageOfProductsSuccess({ data, hasNextPage }));
    } catch (error) {
      dispatch(getFirstPageOfProductsFailure({ error }));
    }
  };
}

export const getNextPageOfProductsRequest = createAction(types.GET_NEXT_PAGE_OF_PRODUCTS_REQUEST);

export const getNextPageOfProductsFailure = createAction(types.GET_NEXT_PAGE_OF_PRODUCTS_FAILURE);

export const getNextPageOfProductsSuccess = createAction(types.GET_NEXT_PAGE_OF_PRODUCTS_SUCCESS);

export function getNextPageOfProducts(opts: Object) {
  return async (dispatch: Function) => {
    try {
      dispatch(getNextPageOfProductsRequest());

      const query = gql`
        query product($cursor: String!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
          products(first: 3, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
            edges {
              node {
                title
                handle
                description
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      `;

      const response = await shopify.query({
        query,
        variables: {
          cursor: opts.cursor,
          query: opts.query || '',
          sortKey: opts.sortKey ? opts.sortKey.toUpperCase() : 'BEST_SELLING',
          reverse: opts.reverse === 'true' ? true : false,
        },
      });

      const { hasNextPage } = response.data.products.pageInfo;

      const data = response.data.products.edges.map(({ node, cursor }) => ({
        title: node.title,
        handle: node.handle,
        description: node.description,
        cursor,
      }));

      dispatch(getNextPageOfProductsSuccess({ data, hasNextPage }));
    } catch (error) {
      dispatch(getNextPageOfProductsFailure({ error }));
    }
  };
}
