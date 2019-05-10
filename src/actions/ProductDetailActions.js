import { createAction } from 'redux-starter-kit';
import { gql } from 'apollo-boost';
import { types } from '../constants';
import shopify from '../services/shopify';

export const getProductDetailRequest = createAction(
  types.GET_PRODUCT_DETAIL_REQUEST
);
export const getProductDetailFailure = createAction(
  types.GET_PRODUCT_DETAIL_FAILURE
);
export const getProductDetailSuccess = createAction(
  types.GET_PRODUCT_DETAIL_SUCCESS
);

export const getProductDetail = (handle: string) => {
  return async (dispatch: Function) => {
    try {
      dispatch(getProductDetailRequest());

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

      dispatch(getProductDetailSuccess(product));
    } catch (error) {
      dispatch(getProductDetailFailure(error));
    }
  };
};
