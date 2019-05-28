import React, { ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import Product from '../components/Product/Product';
import * as productService from '../services/product.service';
import { ProductState } from '../store/product';

interface Props {
  products: ProductState;
  dispatch: Function;
  notLoaded: boolean;
}

function getProduct(handle): Function {
  return productService.fetch({ handle });
}

function ProductPage({ product, notLoaded, dispatch, router }: Props): ReactElement {
  useEffect((): void => {
    if (notLoaded) dispatch(getProduct(router.query.handle));
  }, []);

  return <Product product={product} />;
}

ProductPage.getInitialProps = async ({ store, req }: any): Promise<object> => {
  const isServer = req;
  isServer && (await store.dispatch(getProduct(req.params.handle)));
  return { notLoaded: req ? false : true };
};

function mapStateToProps({ product }: any): object {
  return { product };
}

export default withRouter(connect(mapStateToProps)(ProductPage));
