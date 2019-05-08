import { combineReducers } from 'redux-starter-kit';
import productList from './productList';
import productDetail from './productDetail';

export const rootReducer = combineReducers({
  productList,
  productDetail,
});
