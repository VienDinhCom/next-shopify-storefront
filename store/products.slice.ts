import { createSlice } from 'redux-starter-kit';
import { ProductsFragment } from '../types'

export interface ProductsState {
  firstPage: {
    loading: boolean;
    error: Error;
  };
  nextPage: {
    loading: boolean;
    error: Error;
  };
  data: ProductsFragment;
}

interface ProductsAction {
  payload: {
    error?: Error;
    data?: ProductsFragment;
  };
}

const initialState = {
  firstPage: {
    loading: true,
    error: null,
  },
  nextPage: {
    loading: false,
    error: null,
  },
  data: null
};

export default createSlice({
  slice: 'products',
  initialState,
  reducers: {
    firstPageRequest: (state: ProductsState) => {
      state.firstPage.loading = true;
      state.firstPage.error = null;
    },
    firstPageFailure: (state: ProductsState, { payload }: ProductsAction) => {
      state.firstPage.loading = false;
      state.firstPage.error = payload.error;
    },
    firstPageSuccess: (state: ProductsState, { payload }: ProductsAction) => {
      state.firstPage.loading = false;
      state.data = payload.data;
    },
    nextPageRequest: (state: ProductsState) => {
      state.nextPage.loading = true;
      state.nextPage.error = null;
    },
    nextPageFailure: (state: ProductsState, { payload }: ProductsAction) => {
      state.nextPage.loading = false;
      state.nextPage.error = payload.error;
    },
    nextPageSuccess: (state: ProductsState, { payload }: ProductsAction) => {
      state.nextPage.loading = false;
      state.data.edges = state.data.edges.concat(payload.data.edges);
      state.data.pageInfo.hasNextPage = payload.data.pageInfo.hasNextPage
    },
  },
});
