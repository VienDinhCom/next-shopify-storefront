import { createReducer } from 'redux-starter-kit';
import { addVariantToCartRequest, addVariantToCartFailure, addVariantToCartSuccess } from '../actions';

const defaultState = {
  loading: true,
  error: null,
  data: {},
};

export default createReducer(defaultState, {
  [addVariantToCartRequest]: state => {
    state.loading = true;
    state.error = null;
  },
  [addVariantToCartFailure]: (state, { payload }) => {
    state.loading = false;
    state.error = payload.error;
  },
  [addVariantToCartSuccess]: (state, { payload }) => {
    state.loading = false;
    state.data = payload.data;
  },
});
