import { createSlice } from 'redux-starter-kit';
import { ProductsFragment } from '../models';

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
    error: null
  },
  nextPage: {
    loading: false,
    error: null
  },
  data: null
};

export default createSlice({
  slice: 'products',
  initialState,
  reducers: {
    getFirstPageRequest: () => {
      return initialState;
    },
    getFirstPageFailure: (state: ProductsState, { payload }: ProductsAction) => {
      state.firstPage.loading = false;
      state.firstPage.error = payload.error;
    },
    getFirstPageSuccess: (state: ProductsState, { payload }: ProductsAction) => {
      state.firstPage.loading = false;
      state.data = payload.data;
    },
    getNextPageRequest: (state: ProductsState) => {
      state.nextPage.loading = true;
      state.nextPage.error = null;
    },
    getNextPageFailure: (state: ProductsState, { payload }: ProductsAction) => {
      state.nextPage.loading = false;
      state.nextPage.error = payload.error;
    },
    getNextPageSuccess: (state: ProductsState, { payload }: ProductsAction) => {
      state.nextPage.loading = false;
      state.data.edges = state.data.edges.concat(payload.data.edges);
      state.data.pageInfo.hasNextPage = payload.data.pageInfo.hasNextPage;
    }
  }
});
