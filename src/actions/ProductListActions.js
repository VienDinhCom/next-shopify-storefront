import { createAction } from 'redux-starter-kit';
import { types } from '../constants';

export const getProductListRequest = createAction(
  types.GET_PRODUCT_LIST_REQUEST
);
export const getProductListFailure = createAction(
  types.GET_PRODUCT_LIST_FAILURE
);
export const getProductListSuccess = createAction(
  types.GET_PRODUCT_LIST_SUCCESS
);

export const getProductList = () => {
  return (dispatch: Function) => {
    dispatch(getProductListRequest());
    dispatch(getProductListFailure());
    dispatch(getProductListSuccess('Hello'));
  };
};
