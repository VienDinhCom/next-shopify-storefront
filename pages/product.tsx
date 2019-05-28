import React, { ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';
import Product from '../components/Product/Product';
import * as productService from '../services/product.service';
import { ProductState } from '../store/product';

interface Props {
  products: ProductState;
  dispatch: Function;
  notLoaded: boolean;
}

function getProduct(): Function {
  return productService.fetch({ handle: 'phone-with-pop-out-holder-1' });
}

function ProductPage({ product, notLoaded, dispatch }: Props): ReactElement {
  useEffect((): void => {
    if (notLoaded) dispatch(getProduct());
  }, []);

  return <Product product={product} />;
}

ProductPage.getInitialProps = async ({ store, res }: any): Promise<object> => {
  res && (await store.dispatch(getProduct()));
  return { notLoaded: res ? false : true };
};

function mapStateToProps({ product }: any): object {
  return { product };
}

export default connect(mapStateToProps)(ProductPage);
