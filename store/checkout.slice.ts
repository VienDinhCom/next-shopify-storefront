import { createSlice } from 'redux-starter-kit';
import { CheckoutFragment } from '../models';

export interface CheckoutState {
  loading: boolean;
  error: Error;
  data: CheckoutFragment;
}

interface CheckoutAction {
  payload: {
    error?: Error;
    data?: CheckoutFragment;
  };
}

const initialState = {
  loading: true,
  error: null,
  data: null
};

export default createSlice({
  slice: 'checkout',
  initialState,
  reducers: {
    getRequest: () => {
      return initialState;
    },
    getFailure: (state: CheckoutState, { payload }: CheckoutAction) => {
      state.loading = false;
      state.error = payload.error;
    },
    getSuccess: (state: CheckoutState, { payload }: CheckoutAction) => {
      state.loading = false;
      state.data = payload.data;
    },
    lineItemsReplaceRequest: (state: CheckoutState) => {
      state.loading = true;
      state.error = null;
    },
    lineItemReplaceFailure: (state: CheckoutState, { payload }: CheckoutAction) => {
      state.loading = false;
      state.error = payload.error;
    },
    lineItemsReplaceSuccess: (state: CheckoutState, { payload }: CheckoutAction) => {
      state.loading = false;
      state.data = payload.data;
    }
  }
});
