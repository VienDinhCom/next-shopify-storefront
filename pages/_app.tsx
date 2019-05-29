import App, { Container } from 'next/app';
import React, { ReactElement } from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import withRedux from '../hocs/withRedux';
import * as services from '../services';

interface Props {
  store: Store;
}

async function fetchCheckout(req, res, store): void {
  const checkoutId = await services.checkout.create(req, res);
  await store.dispatch(services.checkout.fetch(checkoutId));
}

class Root extends App<Props> {
  public static async getInitialProps({ Component, ctx }: object): object {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

    if (ctx.res) await fetchCheckout(ctx.req, ctx.res, ctx.store);

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

export default withRedux(Root);
