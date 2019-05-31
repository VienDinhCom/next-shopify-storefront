import App, { Container } from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import withMui from '../hocs/withMui';
import withRedux from '../hocs/withRedux';
import * as services from '../services';

interface Props {
  store: Store;
}

class Root extends App<Props> {
  public static async getInitialProps({ Component, ctx }) {
    const isServer = ctx.res;
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

    if (isServer) {
      await ctx.store.dispatch(services.checkout.fetch(ctx.req, ctx.res));
    }

    return { pageProps };
  }

  public render() {
    const { Component, pageProps, store } = this.props;

    return (
      <Container>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default withRedux(withMui(Root));
