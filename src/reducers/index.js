import { combineReducers } from 'redux-starter-kit';
import product from './product';
import products from './products';

export const rootReducer = combineReducers({
  product,
  products,
});
