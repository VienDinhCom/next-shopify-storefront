import React from 'react';
import { connect } from 'react-redux';
import Products from '../components/Products/Products';
import * as services from '../services';
import { ProductsState } from '../store/products.slice';
import isServer from 'detect-node';

interface Props {
  products: ProductsState;
  notLoaded: boolean;
  query: {
    query: string;
    reverse: boolean;
    sortKey: string;
    sortIndex: number;
  };
}

function ProductsPage({ products, query }: Props) {

  return <Products products={products} query={query} />;
}

ProductsPage.getInitialProps = async context => {
  const { store, query } = context;
  const transformedQuery = { ...query, reverse: query.reverse === 'true' ? true : false };

  if (isServer) {
    await store.dispatch(services.products.getFirstPage(transformedQuery));
  } else {
    store.dispatch(services.products.getFirstPage(transformedQuery));
  }

  return { query: transformedQuery };
};

function mapStateToProps({ products }: { products: ProductsState }) {
  return { products };
}

export default connect(mapStateToProps)(ProductsPage);
