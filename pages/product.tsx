import React from 'react';
import { connect } from 'react-redux';
import Product from '../components/Product/Product';
import * as services from '../services';
import { ProductState } from '../store/product.slice';
import isServer from 'detect-node';

interface Props {
  product: ProductState;
  query: {
    handle: string;
  };
}

function ProductPage({ product }: Props) {
  return <Product product={product} />;
}

ProductPage.getInitialProps = async context => {
  const { store, query } = context;

  if (isServer) {
    await store.dispatch(services.product.fetch({ handle: query.handle }));
  } else {
    store.dispatch(services.product.fetch({ handle: query.handle }));
  }

  return {};
};

function mapStateToProps({ product }: { product: ProductState }) {
  return { product };
}

export default connect(mapStateToProps)(ProductPage);
