import { createSlice } from 'redux-starter-kit';

const initialState = {
  loading: true,
  error: null,
  item: {}
};

export default createSlice({
  slice: 'product',
  initialState,
  reducers: {
    request: () => {
      return initialState;
    },
    failure: (state, { payload }) => {
      state.loading = false;
      state.error = payload.error;
    },
    success: (state, { payload }) => {
      state.loading = false;
      state.item = payload.item;
    }
  }
});
