import { combineReducers } from 'redux-starter-kit';
import productList from './productList';
import productItem from './productItem';

export const rootReducer = combineReducers({
  productList,
  productItem,
});
