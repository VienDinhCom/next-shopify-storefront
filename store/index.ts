import { combineReducers, configureStore, Store } from 'redux-starter-kit';
import checkout from './checkout.slice';
import product from './product.slice';
import products from './products.slice';

export const actions = {
  checkout: checkout.actions,
  product: product.actions,
  products: products.actions
};

const rootReducer = combineReducers({
  checkout: checkout.reducer,
  product: product.reducer,
  products: products.reducer
});

export function createStore(initialState = {}): Store {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState
  });
}
