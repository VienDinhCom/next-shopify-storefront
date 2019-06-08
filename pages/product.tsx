import React from 'react';
import { connect } from 'react-redux';
import Product from '../components/Product/Product';
import services from '../services';
import { ProductState } from '../store/product.slice';
import isServer from 'detect-node';

interface Props {
  product: ProductState;
  dispatch: Function;
}

function ProductPage({ product, dispatch }: Props) {
  return <Product product={product} dispatch={dispatch} />;
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
