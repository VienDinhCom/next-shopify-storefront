import { createAction } from 'redux-starter-kit';
import { gql } from 'apollo-boost';
import { types } from '../constants';
import shopify from '../services/shopify';

export const getProductRequest = createAction(types.GET_PRODUCT_REQUEST);
export const getProductFailure = createAction(types.GET_PRODUCT_FAILURE);
export const getProductSuccess = createAction(types.GET_PRODUCT_SUCCESS);

export const getProduct = (handle: string) => {
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
          }
        }
      `;

      const response = await shopify.query({
        query,
        variables: {
          handle,
        },
      });

      let data = response.data.productByHandle;

      data = {
        title: data.title,
        description: data.description,
        images: data.images.edges.map(({ node }) => node.originalSrc),
      };

      dispatch(getProductSuccess({ data }));
    } catch (error) {
      dispatch(getProductFailure({ error }));
    }
  };
};
