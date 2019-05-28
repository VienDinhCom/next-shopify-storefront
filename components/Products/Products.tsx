import React, { ReactElement } from 'react';
import queryString from 'query-string';
import Router from 'next/router';
import dayjs from 'dayjs';
import Layout from '../Layout';
import { ProductsState } from '../../store/products';
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

  return (
    <Layout>
      {props.products.firstPage.loading ? 'Loading...' : null}
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
          {/* <tr>
          <td colSpan="3" align="center">
            {nextPage.error && <p>Error: {nextPage.error}</p>}
            <button disabled={!hasNextPage} onClick={() => this.handleNextPage(data[data.length - 1].cursor)}>
              {nextPage.loading ? 'Loading' : nextPage.error ? 'Try Again' : 'Load More'}
            </button>
          </td>
        </tr> */}
        </tbody>
      </table>
    </Layout>
  );
}

export default Products;
