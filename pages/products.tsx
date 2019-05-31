import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Products from '../components/Products/Products';
import * as services from '../services';
import { ProductsState } from '../store/products.slice';

interface Props {
  products: ProductsState;
  dispatch: Function;
  notLoaded: boolean;
  query: {
    query: string;
    reverse: boolean;
    sortKey: string;
    sortIndex: number;
  };
}

function getFirstPage({ query, reverse, sortKey }) {
  return services.products.getFirstPage({
    query,
    sortKey,
    reverse,
  });
}

function ProductsPage({ products, notLoaded, query, dispatch }: Props) {
  useEffect(() => {
    if (notLoaded) {
      dispatch(getFirstPage(query));
    }
  }, [query]);

  return <Products products={products} query={query} />;
}

ProductsPage.getInitialProps = async context => {
  const { store, req, query } = context;
  const isServer = req;
  const notLoaded = req ? false : true;
  const transformedQuery = { ...query, reverse: query.reverse === 'true' ? true : false };

  if (isServer) {
    await store.dispatch(getFirstPage(transformedQuery));
  }

  return { notLoaded, query: transformedQuery };
};

function mapStateToProps({ products }: { products: ProductsState }) {
  return { products };
}

export default connect(mapStateToProps)(ProductsPage);
