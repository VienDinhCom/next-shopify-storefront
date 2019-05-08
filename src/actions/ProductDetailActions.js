import { createAction } from 'redux-starter-kit';
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

export const getProductDetail = (productId: string) => {
  return async (dispatch: Function) => {
    try {
      dispatch(getProductDetailRequest());

      let product = await shopify.product.fetch(productId);

      product = {
        id: product.id,
        title: product.title,
        images: product.images.map(({ src }) => src),
      };

      dispatch(getProductDetailSuccess(product));
    } catch (error) {
      dispatch(getProductDetailFailure(error));
    }
  };
};
