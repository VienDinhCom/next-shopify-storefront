import { createReducer } from 'redux-starter-kit';
import {
  getProductListRequest,
  getProductListFailure,
  getProductListSuccess,
} from '../actions';

const defaultState = {
  loading: false,
  error: null,
  data: null,
};

export default createReducer(defaultState, {
  [getProductListRequest]: (state, action) => ({
    loading: true,
  }),
  [getProductListFailure]: (state, action) => ({
    error: action.payload,
  }),
  [getProductListSuccess]: (state, action) => ({
    data: action.payload,
  }),
});
