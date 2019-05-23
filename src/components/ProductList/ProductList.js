import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import dayjs from 'dayjs';
import { getFristPageOfProducts, getNextPageOfProducts } from '../../actions';

const sortOpts = [
  {
    name: 'Best Selling',
    sortKey: 'best_selling',
    reverse: false,
  },
  {
    name: 'Newest',
    sortKey: 'created_at',
    reverse: true,
  },
  {
    name: 'Oldest',
    sortKey: 'created_at',
    reverse: false,
  },
  {
    name: 'Price (Low > High)',
    sortKey: 'price',
    reverse: false,
  },
  {
    name: 'Price (High > Low)',
    sortKey: 'price',
    reverse: true,
  },
  {
    name: 'Title (A - Z)',
    sortKey: 'title',
    reverse: false,
  },
  {
    name: 'Title (Z - A)',
    sortKey: 'title',
    reverse: true,
  },
];

class ProductList extends Component<Object, Object> {
  state = {
    query: '',
    sort: 0,
  };
  componentWillMount() {
    const { query, sortKey, reverse } = queryString.parse(this.props.location.search);

    const sort = sortOpts.findIndex(
      opt => opt.sortKey === sortKey && opt.reverse === (reverse === 'true' ? true : false)
    );

    this.setState({ query, sort });
    this.handleFristPage(this.props.location.search);
  }
  componentWillReceiveProps(nextProps) {
    const { props } = this;

    if (props.location.search !== nextProps.location.search) {
      this.handleFristPage(nextProps.location.search);
    }
  }
  handleFristPage = (search: string) => {
    const { query, sortKey, reverse } = queryString.parse(search);

    this.props.getFristPageOfProducts({
      query,
      sortKey,
      reverse,
    });
  };
  handleNextPage = (cursor: string) => {
    const { query, sortKey, reverse } = queryString.parse(this.props.location.search);

    this.props.getNextPageOfProducts({
      query,
      cursor,
      sortKey,
      reverse,
    });
  };
  handleQuery = event => {
    event.preventDefault();
    const search = queryString.parse(this.props.location.search);

    this.props.history.push({
      search: queryString.stringify({ ...search, query: this.state.query }),
    });
  };
  handleSort = event => {
    const { sortKey, reverse } = sortOpts[event.target.value];

    const sort = sortOpts.findIndex(opt => opt.sortKey === sortKey && opt.reverse === reverse);

    this.setState({ sort });

    const search = queryString.parse(this.props.location.search);

    this.props.history.push({
      search: queryString.stringify({ ...search, sortKey, reverse }),
    });
  };
  render() {
    const { props, state } = this;
    const { data, firstPage, nextPage, hasNextPage } = props.products;

    if (firstPage.loading) return <p>Loading...</p>;

    if (firstPage.error) return <p>Error: {firstPage.error.message}</p>;

    return (
      <table className="table table-bordered">
        <tbody>
          <tr>
            <td colSpan="3">
              <form action="" onSubmit={this.handleQuery}>
                <input
                  type="text"
                  value={state.query}
                  onChange={event => this.setState({ query: event.target.value })}
                />
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
          </tr>
          <tr>
            <td style={{ width: 200 }}>Title</td>
            <td>Date</td>
            <td>Price</td>
          </tr>
          {data.map(({ handle, title, description, priceRange, createdAt }) => (
            <tr key={handle}>
              <td onClick={() => props.history.push(`/product/${handle}`)}>{title}</td>
              <td>{dayjs(createdAt).format('DD/MM/YYYY')}</td>
              <td>
                {priceRange.minVariantPrice.amount} {priceRange.minVariantPrice.currencyCode}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="3" align="center">
              {nextPage.error && <p>Error: {nextPage.error}</p>}
              <button disabled={!hasNextPage} onClick={() => this.handleNextPage(data[data.length - 1].cursor)}>
                {nextPage.loading ? 'Loading' : nextPage.error ? 'Try Again' : 'Load More'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

function mapStateToProps({ products }) {
  return { products };
}

function mapDispatchToProps(dispatch) {
  return {
    getFristPageOfProducts: (opts: Object) => dispatch(getFristPageOfProducts(opts)),
    getNextPageOfProducts: (opts: Object) => dispatch(getNextPageOfProducts(opts)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList);
