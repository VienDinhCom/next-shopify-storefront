import { createSlice } from 'redux-starter-kit';

export interface ProductState {
  loading: boolean;
  error: Error | null;
  item: any;
}

interface CheckoutAction {
  payload: {
    error?: Error;
    item?: any;
  };
}

const initialState: ProductState = {
  loading: true,
  error: null,
  item: {},
};

export default createSlice({
  slice: 'product',
  initialState,
  reducers: {
    request: (): ProductState => initialState,
    failure: (state: ProductState, { payload }: CheckoutAction): void => {
      state.loading = false;
      state.error = payload.error || null;
    },
    success: (state: ProductState, { payload }: CheckoutAction): void => {
      state.loading = false;
      state.item = payload.item || null;
    },
  },
});
