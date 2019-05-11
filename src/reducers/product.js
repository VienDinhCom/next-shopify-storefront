import { createReducer } from 'redux-starter-kit';
import { getProductRequest, getProductFailure, getProductSuccess } from '../actions';

const defaultState = {
  loading: true,
  error: null,
  data: {},
};

export default createReducer(defaultState, {
  [getProductRequest]: () => {
    return defaultState;
  },
  [getProductFailure]: (state, { payload }) => {
    state.loading = false;
    state.error = payload.error;
  },
  [getProductSuccess]: (state, { payload }) => {
    state.loading = false;
    state.data = payload.data;
  },
});
