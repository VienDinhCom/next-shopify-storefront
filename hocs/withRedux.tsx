import React, { Component, ReactElement } from 'react';
import { NextComponentClass } from 'next';
import { createStore } from '../store';
import { Store } from 'redux';

interface Props {
  initialState: object;
}

function withRedux(App: any): NextComponentClass {
  return class AppWithRedux extends Component<Props> {
    public static async getInitialProps(appContext: any): Promise<object> {
      let appProps = {};
      const store = createStore();

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

      this.store = createStore(props.initialState);
    }

    public render(): ReactElement {
      return <App {...this.props} store={this.store} />;
    }
  };
}

export default withRedux;
