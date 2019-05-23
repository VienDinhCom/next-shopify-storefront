import { configureStore } from 'redux-starter-kit';
import { rootReducer } from './reducers';
import { getCart } from './actions/CartActions';

export const store = configureStore({ reducer: rootReducer });

store.dispatch(getCart());
