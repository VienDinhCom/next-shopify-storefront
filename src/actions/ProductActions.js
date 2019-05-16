import { createAction } from 'redux-starter-kit';
import { gql } from 'apollo-boost';
import { types } from '../constants';
import shopify from '../services/shopify';

export const getProductRequest = createAction(types.GET_PRODUCT_REQUEST);
export const getProductFailure = createAction(types.GET_PRODUCT_FAILURE);
export const getProductSuccess = createAction(types.GET_PRODUCT_SUCCESS);

export const getProduct = (args: Object) => {
  return async (dispatch: Function) => {
    try {
      dispatch(getProductRequest());

      const query = gql`
        query product($handle: String!) {
          productByHandle(handle: $handle) {
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
        }
      `;

      const response = await shopify.query({
        query,
        variables: {
          handle: args.handle,
        },
      });

      let data = response.data.productByHandle;

      dispatch(getProductSuccess({ data }));
    } catch (error) {
      dispatch(getProductFailure({ error }));
    }
  };
};
