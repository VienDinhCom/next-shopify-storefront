import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { getFristPageOfProducts, getNextPageOfProducts } from '../../actions';

class ProductList extends Component<any, any> {
  state = {
    query: '',
  };
  componentWillMount() {
    const { query } = queryString.parse(this.props.location.search);

    this.setState({ query });
    this.handleFristPage(this.props.location.search);
  }
  handleFristPage = (search: string) => {
    const { query } = queryString.parse(search);

    this.props.getFristPageOfProducts({
      query: query,
    });
  };
  handleNextPage = (cursor: string) => {
    const { query } = queryString.parse(this.props.location.search);

    this.props.getNextPageOfProducts({
      query,
      cursor,
    });
  };
  handleQuery = event => {
    event.preventDefault();
    const search = queryString.stringify({ query: this.state.query });
    this.props.history.push({ search });
    this.handleFristPage(search);
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
                {nextPage.loading ? 'Loading' : nextPage.error ? 'Try Again' : 'LoadMore'}
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
