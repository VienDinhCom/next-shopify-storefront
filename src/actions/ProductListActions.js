import { createAction } from 'redux-starter-kit';
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

      let products = await shopify.product.fetchAll();

      products = products.map(product => {
        return {
          id: product.id,
          title: product.title,
          images: product.images.map(({ src }) => src),
        };
      });

      dispatch(getProductListSuccess(products));
    } catch (error) {
      dispatch(getProductListFailure(error));
    }
  };
}
