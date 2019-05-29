import React, { ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';
import Product from '../components/Product/Product';
import * as services from '../services';
import { ProductState } from '../store/product.slice';

interface Props {
  products: ProductState;
  dispatch: Function;
  notLoaded: boolean;
}

function getProduct(handle): Function {
  return services.product.fetch({ handle });
}

function ProductPage({ product, notLoaded, dispatch, query }: Props): ReactElement {
  useEffect((): void => {
    if (notLoaded) dispatch(getProduct(query.handle));
  }, []);

  return <Product product={product} />;
}

ProductPage.getInitialProps = async (context: any): Promise<object> => {
  const { store, req, query } = context;
  const isServer = req;
  const notLoaded = req ? false : true;

  isServer && (await store.dispatch(getProduct(query.handle)));

  return { notLoaded, query };
};

function mapStateToProps({ product }: any): object {
  return { product };
}

export default connect(mapStateToProps)(ProductPage);
