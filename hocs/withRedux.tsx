import React, { Component, ReactElement } from 'react';
import { NextComponentClass } from 'next';
import { NextAppContext } from 'next/app';
import { createStore } from '../store';
import { Store } from 'redux';

interface Props {
  initialState: object;
}

let store: Store;

function withRedux(App: NextComponentClass): NextComponentClass {
  return class AppWithRedux extends Component<Props> {
    public static async getInitialProps(appContext: NextAppContext): Promise<object> {
      let appProps = {};
      const isServer = appContext.ctx.res;

      if (isServer) store = createStore();

      appContext.ctx.store = store;

      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(appContext);
      }

      return {
        ...appProps,
        initialState: store.getState()
      };
    }

    public constructor(props: Props) {
      super(props);
      store = createStore(props.initialState);
    }

    public render(): ReactElement {
      return <App {...this.props} store={store} />;
    }
  };
}

export default withRedux;
