import { configureStore, combineReducers } from 'redux-starter-kit';
import checkout from './checkout';
import product from './product';
import products from './products';

export const actions = {
  checkout: checkout.actions,
  product: product.actions,
  products: products.actions
};

export default configureStore({
  reducer: combineReducers({
    checkout: checkout.reducer,
    product: product.reducer,
    products: products.reducer
  })
});
