import { createAction } from 'redux-starter-kit';
import { types } from '../constants';

export const getProductItemRequest = createAction(
  types.GET_PRODUCT_ITEM_REQUEST
);
export const getProductItemFailure = createAction(
  types.GET_PRODUCT_ITEM_FAILURE
);
export const getProductItemSuccess = createAction(
  types.GET_PRODUCT_ITEM_SUCCESS
);

export const getProductItem = () => {
  return (dispatch: Function) => {
    dispatch(getProductItemRequest());
    dispatch(getProductItemFailure());
    dispatch(getProductItemSuccess('Hello'));
  };
};
