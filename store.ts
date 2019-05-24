import { configureStore, createReducer, createAction } from 'redux-starter-kit';

export const increment = createAction('increment');
export const decrement = createAction('decrement');

const rootReducer = createReducer(0, {
  [increment.type]: (state, action) => state + action.payload,
  [decrement.type]: (state, action) => state - action.payload
});

const store = configureStore({
  reducer: rootReducer
});

export default store;
