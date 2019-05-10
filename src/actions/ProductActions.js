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

      const { data } = await shopify.query({
        query,
        variables: {
          handle,
        },
      });

      let product = data.productByHandle;

      product = {
        title: product.title,
        description: product.description,
        images: product.images.edges.map(({ node }) => node.originalSrc),
      };

      dispatch(getProductSuccess(product));
    } catch (error) {
      dispatch(getProductFailure(error));
    }
  };
};
