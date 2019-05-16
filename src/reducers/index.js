import { combineReducers } from 'redux-starter-kit';
import cart from './cart';
import product from './product';
import products from './products';

export const rootReducer = combineReducers({
  cart,
  product,
  products,
});
