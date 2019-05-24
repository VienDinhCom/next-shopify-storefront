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
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default Root;
