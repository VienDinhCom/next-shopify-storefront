import { createSlice } from 'redux-starter-kit';

const initialState = {
  loading: true,
  error: null,
  item: {}
};

export default createSlice({
  slice: 'checkout',
  initialState,
  reducers: {
    request: state => {
      state.loading = true;
      state.error = null;
    },
    failure: (state, { payload }) => {
      state.loading = false;
      state.error = payload.error;
    },
    success: (state, { payload }) => {
      state.loading = false;
      state.item = payload.item;
    },
    lineItemsReplaceRequest: state => {
      state.loading = true;
      state.error = null;
    },
    lineItemsReplaceFailure: (state, { payload }) => {
      state.loading = false;
      state.error = payload.error;
    },
    lineItemsReplaceSuccess: (state, { payload }) => {
      state.loading = false;
      state.item = payload.item;
    }
  }
});
