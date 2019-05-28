import React, { ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';
import Products from '../components/Products/Products';
import * as productsService from '../services/products.service';
import { ProductsState } from '../store/products';

interface Props {
  products: ProductsState;
  dispatch: Function;
  notLoaded: boolean;
}

function getFirstPage(): Function {
  return productsService.getFirstPage({
    query: '',
    reverse: false,
    sortKey: ''
  });
}

function ProductsPage({ products, notLoaded, dispatch }: Props): ReactElement {
  useEffect((): void => {
    if (notLoaded) dispatch(getFirstPage());
  }, []);

  return <Products products={products} />;
}

ProductsPage.getInitialProps = async ({ store, req }: any): Promise<object> => {
  const isServer = req;
  isServer && (await store.dispatch(getFirstPage()));
  return { notLoaded: req ? false : true };
};

function mapStateToProps({ products }: any): object {
  return { products };
}

export default connect(mapStateToProps)(ProductsPage);
