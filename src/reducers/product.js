import { createReducer } from 'redux-starter-kit';
import { getProductDetailRequest, getProductDetailFailure, getProductDetailSuccess } from '../actions';

const defaultState = {
  loading: false,
  error: null,
  data: {},
};

export default createReducer(defaultState, {
  [getProductDetailRequest]: (state, action) => ({
    loading: true,
  }),
  [getProductDetailFailure]: (state, action) => ({
    error: action.payload,
  }),
  [getProductDetailSuccess]: (state, action) => ({
    data: action.payload,
  }),
});
