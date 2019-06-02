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
  items: ProductsFragment;
}

interface ProductsAction {
  payload: {
    error?: Error;
    items?: ProductsFragment;
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
  items: null
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
      state.items = payload.items;
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
      state.items.edges = state.items.edges.concat(payload.items.edges);
      state.items.pageInfo.hasNextPage = payload.items.pageInfo.hasNextPage
    },
  },
});
