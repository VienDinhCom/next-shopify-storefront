import React from 'react';
import { connect } from 'react-redux';
import Products from '../components/Products/Products';
import services from '../services';
import { ProductsState } from '../store/products.slice';
import isServer from 'detect-node';
import { ProductSortKeys } from '../models';

interface Props {
  products: ProductsState;
  dispatch: Function;
  query: {
    query: string;
    reverse: boolean;
    sortKey: ProductSortKeys;
    sortIndex: number;
  };
}

function ProductsPage({ products, query, dispatch }: Props) {
  return <Products products={products} query={query} dispatch={dispatch} />;
}

ProductsPage.getInitialProps = async context => {
  const { store } = context;
  const { query, sortKey, sortIndex, reverse } = context.query;

  const transformedQuery = {
    ...query,
    query: query || '',
    sortKey: sortKey ? sortKey.toUpperCase() : ProductSortKeys.BestSelling,
    sortIndex: sortIndex ? parseInt(sortIndex) : 0,
    reverse: reverse === 'true' ? true : false
  };

  if (isServer) {
    await store.dispatch(services.products.getFirstPage(transformedQuery));
  } else {
    store.dispatch(services.products.getFirstPage(transformedQuery));
  }

  return { query: transformedQuery, dispatch: store.dispatch };
};

function mapStateToProps({ products }: { products: ProductsState }) {
  return { products };
}

export default connect(mapStateToProps)(ProductsPage);
