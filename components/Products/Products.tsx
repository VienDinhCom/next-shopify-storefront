import React, { ReactElement } from 'react';
import Layout from '../Layout';
import { ProductsState } from '../../store/products';
import dayjs from 'dayjs';

interface Props {
  products: ProductsState;
}

function Products(props: Props): ReactElement {
  return (
    <Layout>
      {props.products.firstPage.loading ? 'Loading...' : null}
      <table className="table table-bordered">
        <tbody>
          {/* <tr>
          <td colSpan="3">
            <form action="" onSubmit={this.handleQuery}>
              <input type="text" value={state.query} onChange={event => this.setState({ query: event.target.value })} />
              <button>Search</button>
            </form>
            <select onChange={this.handleSort} value={state.sort}>
              {sortOpts.map(({ name, sortKey, reverse }, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </td>
        </tr> */}
          <tr>
            <td style={{ width: 200 }}>Title</td>
            <td>Date</td>
            <td>Price</td>
          </tr>
          {props.products.items.map(
            ({ handle, title, description, priceRange, createdAt }: any): any => (
              <tr key={handle}>
                <td onClick={() => props.history.push(`/product/${handle}`)}>{title}</td>
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
