import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { getFristPageOfProducts, getNextPageOfProducts } from '../../actions';

class ProductList extends Component<any, any> {
  state = {
    query: '',
    sortKey: 'CREATED_AT',
  };
  componentWillMount() {
    const { query, sortKey } = queryString.parse(this.props.location.search);

    this.setState({ query, sortKey });
    this.handleFristPage(this.props.location.search);
  }
  componentWillReceiveProps(nextProps) {
    const { props } = this;

    if (props.location.search !== nextProps.location.search) {
      this.handleFristPage(nextProps.location.search);
    }
  }
  handleFristPage = (search: string) => {
    const { query, sortKey } = queryString.parse(search);

    this.props.getFristPageOfProducts({
      query,
      sortKey,
    });
  };
  handleNextPage = (cursor: string) => {
    const { query, sortKey } = queryString.parse(this.props.location.search);

    this.props.getNextPageOfProducts({
      query,
      cursor,
      sortKey,
    });
  };
  handleQuery = event => {
    event.preventDefault();
    const search = queryString.parse(this.props.location.search);

    this.props.history.push({
      search: queryString.stringify({ ...search, query: this.state.query }),
    });
  };
  handleSortKey = event => {
    this.setState({ sortKey: event.target.value });
    const search = queryString.parse(this.props.location.search);

    this.props.history.push({
      search: queryString.stringify({ ...search, sortKey: event.target.value }),
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
            <td colSpan="2">
              <form action="" onSubmit={this.handleQuery}>
                <input
                  type="text"
                  value={state.query}
                  onChange={event => this.setState({ query: event.target.value })}
                />
                <button>Search</button>
              </form>
              <select onChange={this.handleSortKey} value={state.sortKey}>
                <option value="TITLE">Title</option>
                <option value="PRODUCT_TYPE">Product Type</option>
                <option value="VENDOR">Vendor</option>
                <option value="UPDATED_AT">Updated At</option>
                <option value="CREATED_AT">Created At</option>
                <option value="BEST_SELLING">Best Selling</option>
                <option value="PRICE">Price</option>
                <option value="ID">Id</option>
                <option value="RELEVANCE">Relevance</option>
              </select>
            </td>
          </tr>
          <tr>
            <td style={{ width: 200 }}>Title</td>
            <td>Description</td>
          </tr>
          {data.map(({ handle, title, description }) => (
            <tr key={handle}>
              <td onClick={() => props.history.push(`/product/${handle}`)}>{title}</td>
              <td>{description}</td>
            </tr>
          ))}
          <tr>
            <td colSpan="2" align="center">
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
