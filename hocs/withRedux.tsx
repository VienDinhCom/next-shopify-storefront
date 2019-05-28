import React, { Component, ReactElement } from 'react';
import { NextComponentClass } from 'next';
import { createStore } from '../store';
import { Store } from 'redux';

interface Props {
  initialState: object;
}

let store: Store;

function withRedux(App: any): NextComponentClass {
  return class AppWithRedux extends Component<Props> {
    public static async getInitialProps(appContext: any): Promise<object> {
      let appProps = {};
      const isServer = appContext.ctx.res;

      if (isServer) store = createStore(); // Server Store

      appContext.ctx.store = store;

      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(appContext);
      }

      return {
        ...appProps,
        initialState: store.getState()
      };
    }

    public store: Store;

    public constructor(props: any) {
      super(props);
      store = createStore(props.initialState); // Client Store
    }

    public render(): ReactElement {
      return <App {...this.props} store={store} />;
    }
  };
}

export default withRedux;
