import React from 'react';
import ReactDOM from 'react-dom';
import { configureStore } from 'redux-starter-kit';
import { Provider } from 'react-redux';

import { rootReducer } from './reducers';
import Root from './components/Root/Root';

const store = configureStore({ reducer: rootReducer });

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  (document.getElementById('root'): any)
);
