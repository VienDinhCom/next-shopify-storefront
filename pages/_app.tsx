import Head from 'next/head';
import App, { Container } from 'next/app';
import { Provider } from 'react-redux';
import React from 'react';
import store from '../store';

class Root extends App {
  render() {
    const { Component, pageProps } = this.props;
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

export default Root;
