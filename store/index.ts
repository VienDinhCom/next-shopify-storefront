import { combineReducers, configureStore } from 'redux-starter-kit';
import checkout from './checkout';
import product from './product';
import products from './products';

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

export default configureStore({
  reducer: rootReducer
});
