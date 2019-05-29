import React, { ReactElement } from 'react';
import queryString from 'query-string';
import Router from 'next/router';
import dayjs from 'dayjs';
import { connect } from 'react-redux';
import * as services from '../../services';
import Layout from '../Layout/Layout';
import Link from '../Link';

interface Props {
  products: ProductsState;
}

const sortOpts = [
  {
    name: 'Best Selling',
    sortKey: 'best_selling',
    reverse: false
  },
  {
    name: 'Newest',
    sortKey: 'created_at',
    reverse: true
  },
  {
    name: 'Oldest',
    sortKey: 'created_at',
    reverse: false
  },
  {
    name: 'Price (Low > High)',
    sortKey: 'price',
    reverse: false
  },
  {
    name: 'Price (High > Low)',
    sortKey: 'price',
    reverse: true
  },
  {
    name: 'Title (A - Z)',
    sortKey: 'title',
    reverse: false
  },
  {
    name: 'Title (Z - A)',
    sortKey: 'title',
    reverse: true
  }
];

function pushQueryString(queryStr: string): void {
  const { router } = Router;
  router.push(`${router.pathname}?${queryStr}`);
}

let timeoutID = 0;

function Products(props: Props): ReactElement {
  // console.log(props);

  function _search(event: Event): void {
    const query = event.target.value;
    const queryStr = queryString.stringify({ ...props.query, query });

    clearTimeout(timeoutID);
    timeoutID = setTimeout((): void => pushQueryString(queryStr), 1000);
  }

  function _sort(event: Event): void {
    const sortIndex = event.target.value;
    const { sortKey, reverse } = sortOpts[sortIndex];
    const queryStr = queryString.stringify({ ...props.query, sortKey, reverse, sortIndex });

    pushQueryString(queryStr);
  }

  function _getNextPage(): void {
    const { query, reverse, sortKey } = props.query;
    const cursor = props.products.items[props.products.items.length - 1].cursor;
    props.dispatch(
      services.products.getNextPage({
        cursor,
        query,
        sortKey,
        reverse: reverse === 'true' ? true : false
      })
    );
  }

  return (
    <Layout>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <td colSpan="3">
              <input type="text" name="query" defaultValue={props.query.query} onChange={_search} />
              <select onChange={_sort} name="sortIndex" value={props.query.sortIndex || 0}>
                {sortOpts.map(
                  ({ name }: object, index: number): ReactElement => (
                    <option key={name} value={index}>
                      {name}
                    </option>
                  )
                )}
              </select>
            </td>
          </tr>
          <tr>
            <td style={{ width: 200 }}>Title</td>
            <td>Date</td>
            <td>Price</td>
          </tr>
          {props.products.firstPage.loading && (
            <tr>
              <td colSpan="3">Loading...</td>
            </tr>
          )}
          {props.products.items.map(
            ({ handle, title, priceRange, createdAt }: any): any => (
              <tr key={handle}>
                <td>
                  <Link path="/product" params={{ handle }}>
                    {title}
                  </Link>
                </td>
                <td>{dayjs(createdAt).format('DD/MM/YYYY')}</td>
                <td>
                  {priceRange.minVariantPrice.amount} {priceRange.minVariantPrice.currencyCode}
                </td>
              </tr>
            )
          )}
          <tr>
            <td colSpan="3" align="center">
              {props.products.nextPage.error && <p>Error: {props.products.nextPage.error}</p>}
              <button disabled={!props.products.hasNextPage} onClick={_getNextPage}>
                {props.products.nextPage.loading
                  ? 'Loading'
                  : props.products.nextPage.error
                  ? 'Try Again'
                  : 'Load More'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </Layout>
  );
}

export default connect()(Products);
