import { createReducer } from 'redux-starter-kit';
import {
  getFirstPageOfProductsRequest,
  getFirstPageOfProductsFailure,
  getFirstPageOfProductsSuccess,
  getNextPageOfProductsRequest,
  getNextPageOfProductsFailure,
  getNextPageOfProductsSuccess,
} from '../actions';

const defaultState = {
  firstPage: {
    loading: true,
    error: null,
  },
  nextPage: {
    loading: false,
    error: null,
  },
  data: null,
  hasNextPage: false,
};

export default createReducer(defaultState, {
  [getFirstPageOfProductsRequest]: state => {
    return defaultState;
  },
  [getFirstPageOfProductsFailure]: (state, { payload }) => {
    state.firstPage.loading = false;
    state.firstPage.error = payload.error;
  },
  [getFirstPageOfProductsSuccess]: (state, { payload }) => {
    state.firstPage.loading = false;
    state.data = payload.data;
    state.hasNextPage = payload.hasNextPage;
  },
  [getNextPageOfProductsRequest]: state => {
    state.nextPage.loading = true;
    state.nextPage.error = null;
  },
  [getNextPageOfProductsFailure]: (state, { payload }) => {
    state.nextPage.loading = false;
    state.nextPage.error = payload.error;
  },
  [getNextPageOfProductsSuccess]: (state, { payload }) => {
    state.nextPage.loading = false;
    state.data = state.data.concat(payload.data);
    state.hasNextPage = payload.hasNextPage;
  },
});
