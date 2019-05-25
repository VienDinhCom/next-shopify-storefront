import { createSlice } from 'redux-starter-kit';

const initialState = {
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
    firstPageRequest: () => {
      return initialState;
    },
    firstPageFailure: (state, { payload }) => {
      state.firstPage.loading = false;
      state.firstPage.error = payload.error;
    },
    firstPageSuccess: (state, { payload }) => {
      state.firstPage.loading = false;
      state.items = payload.items;
      state.hasNextPage = payload.hasNextPage;
    },
    nextPageRequest: state => {
      state.nextPage.loading = true;
      state.nextPage.error = null;
    },
    nextPageFailure: (state, { payload }) => {
      state.nextPage.loading = false;
      state.nextPage.error = payload.error;
    },
    nextPageSuccess: (state, { payload }) => {
      state.nextPage.loading = false;
      state.items = state.items.concat(payload.items);
      state.hasNextPage = payload.hasNextPage;
    }
  }
});
