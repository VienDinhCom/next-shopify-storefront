import React from 'react';
import Product from '../components/Product/Product';
import services from '../services';
import isServer from 'detect-node';

function ProductPage() {
  return <Product />;
}

ProductPage.getInitialProps = async context => {
  const { store, query } = context;

  if (isServer) {
    await store.dispatch(services.product.get({ handle: query.handle }));
  } else {
    store.dispatch(services.product.get({ handle: query.handle }));
  }

  return {};
};

export default ProductPage;
