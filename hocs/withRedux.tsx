import React, { Component } from 'react';
import { Store } from 'redux';
import { createStore } from '../store';

interface Props {
  initialState: object;
}

let store: Store;

function withRedux(App) {
  return class AppWithRedux extends Component<Props> {
    public static async getInitialProps(appContext) {
      let initialProps = {};
      const isServer = appContext.ctx.res;

      if (isServer) {
        store = createStore();
      }

      appContext.ctx.store = store;

      if (typeof App.getInitialProps === 'function') {
        initialProps = await App.getInitialProps(appContext);
      }

      return {
        ...initialProps,
        initialState: store.getState(),
      };
    }

    public constructor(props: Props) {
      super(props);
      store = createStore(props.initialState);
    }

    public render() {
      return <App {...this.props} store={store} />;
    }
  };
}

export default withRedux;
