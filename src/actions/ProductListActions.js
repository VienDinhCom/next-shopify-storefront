import { createAction } from 'redux-starter-kit';
import { gql } from 'apollo-boost';
import { types } from '../constants';
import shopify from '../services/shopify';

export const getProductListRequest = createAction(
  types.GET_PRODUCT_LIST_REQUEST
);
export const getProductListFailure = createAction(
  types.GET_PRODUCT_LIST_FAILURE
);
export const getProductListSuccess = createAction(
  types.GET_PRODUCT_LIST_SUCCESS
);

export function getProductList() {
  return async (dispatch: Function) => {
    try {
      dispatch(getProductListRequest());

      const query = gql`
        {
          products(first: 3) {
            edges {
              node {
                title
                handle
                description
              }
            }
          }
        }
      `;

      const { data } = await shopify.query({ query });
      const products = data.products.edges.map(({ node }) => ({
        title: node.title,
        handle: node.handle,
        description: node.description,
      }));

      dispatch(getProductListSuccess(products));
    } catch (error) {
      dispatch(getProductListFailure(error));
    }
  };
}
