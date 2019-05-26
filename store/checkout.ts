import { createSlice } from 'redux-starter-kit';

export interface CheckoutState {
  loading: boolean;
  error: Error | null;
  item: object;
}

export interface CheckoutAction {
  payload: {
    error?: Error;
    item?: object;
  };
}

const initialState: CheckoutState = {
  loading: true,
  error: null,
  item: {}
};

export default createSlice({
  slice: 'checkout',
  initialState,
  reducers: {
    request: (state: CheckoutState): void => {
      state.loading = true;
      state.error = null;
    },
    failure: (state: CheckoutState, { payload }: CheckoutAction): void => {
      state.loading = false;
      state.error = payload.error || null;
    },
    success: (state: CheckoutState, { payload }: CheckoutAction): void => {
      state.loading = false;
      state.item = payload.item || {};
    },
    lineItemsReplaceRequest: (state: CheckoutState): void => {
      state.loading = true;
      state.error = null;
    },
    lineItemsReplaceFailure: (state: CheckoutState, { payload }: CheckoutAction): void => {
      state.loading = false;
      state.error = payload.error || null;
    },
    lineItemsReplaceSuccess: (state: CheckoutState, { payload }: CheckoutAction): void => {
      state.loading = false;
      state.item = payload.item || {};
    }
  }
});
