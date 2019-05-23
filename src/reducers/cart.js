import { createReducer } from 'redux-starter-kit';
import {
  getCartRequest,
  getCartFailure,
  getCartSuccess,
  changeLineItemsRequest,
  changeLineItemsFailure,
  changeLineItemsSuccess,
} from '../actions';

const defaultState = {
  loading: true,
  error: null,
  data: {},
};

export default createReducer(defaultState, {
  [getCartRequest]: state => {
    state.loading = true;
    state.error = null;
  },
  [getCartFailure]: (state, { payload }) => {
    state.loading = false;
    state.error = payload.error;
  },
  [getCartSuccess]: (state, { payload }) => {
    state.loading = false;
    state.data = payload.data;
  },
  [changeLineItemsRequest]: state => {
    state.loading = true;
    state.error = null;
  },
  [changeLineItemsFailure]: (state, { payload }) => {
    state.loading = false;
    state.error = payload.error;
  },
  [changeLineItemsSuccess]: (state, { payload }) => {
    state.loading = false;
    state.data = payload.data;
  },
});
