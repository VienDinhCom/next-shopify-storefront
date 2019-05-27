import App, { Container } from 'next/app';
import React, { ReactElement } from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import Head from 'next/head';
import withRedux from '../hocs/withRedux';

interface Props {
  store: Store;
}

class Root extends App<Props> {
  public render(): ReactElement {
    const { Component, pageProps, store } = this.props;

    return (
      <Container>
        <Provider store={store}>
          <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          </Head>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default withRedux(Root);
