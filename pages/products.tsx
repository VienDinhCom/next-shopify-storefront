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

function getFirstPage({ query, reverse, sortKey }): Function {
  return productsService.getFirstPage({
    query,
    sortKey,
    reverse: reverse === 'true' ? true : false
  });
}

function ProductsPage({ products, notLoaded, query, dispatch }: Props): ReactElement {
  useEffect((): void => {
    if (notLoaded) dispatch(getFirstPage(query));
  }, [query]);

  return <Products products={products} query={query} />;
}

ProductsPage.getInitialProps = async (context: any): Promise<object> => {
  const { store, req, query } = context;
  const isServer = req;
  const notLoaded = req ? false : true;

  isServer && (await store.dispatch(getFirstPage(query)));

  return { notLoaded, query };
};

function mapStateToProps({ products }: any): object {
  return { products };
}

export default connect(mapStateToProps)(ProductsPage);
