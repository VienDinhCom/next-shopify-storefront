import App, { Container } from 'next/app';
import React, { ReactElement } from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import withRedux from '../hocs/withRedux';
import * as services from '../services';
import withMui from '../hocs/withMui';

interface Props {
  store: Store;
}

class Root extends App<Props> {
  public static async getInitialProps({ Component, ctx }: object): object {
    const isServer = ctx.res;
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

    if (isServer) await ctx.store.dispatch(services.checkout.fetch(ctx.req, ctx.res));

    return { pageProps };
  }
  public render(): ReactElement {
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
