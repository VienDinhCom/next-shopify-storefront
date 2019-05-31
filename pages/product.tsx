import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Product from '../components/Product/Product';
import * as services from '../services';
import { ProductState } from '../store/product.slice';

interface Props {
  product: ProductState;
  dispatch: Function;
  notLoaded: boolean;
  query: {
    handle: string;
  };
}

function getProduct(handle): Function {
  return services.product.fetch({ handle });
}

function ProductPage({ product, notLoaded, dispatch, query }: Props) {
  useEffect(() => {
    if (notLoaded) {
      dispatch(getProduct(query.handle));
    }
  }, []);

  return <Product product={product} />;
}

ProductPage.getInitialProps = async context => {
  const { store, req, query } = context;
  const isServer = req;
  const notLoaded = req ? false : true;

  if (isServer) {
    await store.dispatch(getProduct(query.handle));
  }

  return { notLoaded, query };
};

function mapStateToProps({ product }: { product: ProductState }) {
  return { product };
}

export default connect(mapStateToProps)(ProductPage);
