import { createReducer } from 'redux-starter-kit';
import { getProductRequest, getProductFailure, getProductSuccess } from '../actions';

const defaultState = {
  loading: false,
  error: null,
  data: {},
};

export default createReducer(defaultState, {
  [getProductRequest]: (state, action) => ({
    loading: true,
  }),
  [getProductFailure]: (state, action) => ({
    error: action.payload,
  }),
  [getProductSuccess]: (state, action) => ({
    data: action.payload,
  }),
});
