import { createReducer } from 'redux-starter-kit';
import {
  getProductItemRequest,
  getProductItemFailure,
  getProductItemSuccess,
} from '../actions';

const defaultState = {
  loading: false,
  error: null,
  data: {},
};

export default createReducer(defaultState, {
  [getProductItemRequest]: (state, action) => ({
    loading: true,
  }),
  [getProductItemFailure]: (state, action) => ({
    error: action.payload,
  }),
  [getProductItemSuccess]: (state, action) => ({
    productItem: action.payload,
  }),
});
