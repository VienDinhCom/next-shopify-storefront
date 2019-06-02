import { createSlice } from 'redux-starter-kit';
import { ProductFragment } from '../typings'

export interface ProductState {
  loading: boolean;
  error: Error;
  data: ProductFragment;
}

interface CheckoutAction {
  payload: {
    error?: Error;
    data?: ProductFragment;
  };
}

const initialState = {
  loading: false,
  error: null,
  data: null,
};

export default createSlice({
  slice: 'product',
  initialState,
  reducers: {
    request: (): ProductState => initialState,
    failure: (state: ProductState, { payload }: CheckoutAction) => {
      state.loading = false;
      state.error = payload.error;
    },
    success: (state: ProductState, { payload }: CheckoutAction) => {
      state.loading = false;
      state.data = payload.data;
    },
  },
});
