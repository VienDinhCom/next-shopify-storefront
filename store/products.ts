import { createSlice } from 'redux-starter-kit';

export interface ProductsState {
  firstPage: {
    loading: boolean;
    error: Error | null;
  };
  nextPage: {
    loading: boolean;
    error: Error | null;
  };
  items: object[];
  hasNextPage: boolean;
}

interface ProductsAction {
  payload: {
    error?: Error;
    items?: object[];
    hasNextPage: boolean;
  };
}

const initialState: ProductsState = {
  firstPage: {
    loading: true,
    error: null
  },
  nextPage: {
    loading: false,
    error: null
  },
  items: [],
  hasNextPage: false
};

export default createSlice({
  slice: 'products',
  initialState,
  reducers: {
    firstPageRequest: (): ProductsState => initialState,
    firstPageFailure: (state: ProductsState, { payload }: ProductsAction): void => {
      state.firstPage.loading = false;
      state.firstPage.error = payload.error || null;
    },
    firstPageSuccess: (state: ProductsState, { payload }: ProductsAction): void => {
      state.firstPage.loading = false;
      state.items = payload.items || [];
      state.hasNextPage = payload.hasNextPage;
    },
    nextPageRequest: (state: ProductsState): void => {
      state.nextPage.loading = true;
      state.nextPage.error = null;
    },
    nextPageFailure: (state: ProductsState, { payload }: ProductsAction): void => {
      state.nextPage.loading = false;
      state.nextPage.error = payload.error || null;
    },
    nextPageSuccess: (state: ProductsState, { payload }: ProductsAction): void => {
      state.nextPage.loading = false;
      state.items = state.items.concat(payload.items || []);
      state.hasNextPage = payload.hasNextPage;
    }
  }
});
