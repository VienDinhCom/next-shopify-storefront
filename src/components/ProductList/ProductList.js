import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getFristPageOfProducts, getNextPageOfProducts } from '../../actions';

function ProductList(props) {
  useEffect(() => {
    props.getFristPageOfProducts();
  }, []);

  const { data, firstPage, nextPage, hasNextPage } = props.products;

  if (firstPage.loading) return <p>Loading...</p>;

  if (firstPage.error) return <p>Error: {firstPage.error.message}</p>;

  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <td style={{ width: 200 }}>Title</td>
          <td>Description</td>
        </tr>
      </thead>
      <tbody>
        {data.map(({ handle, title, description }) => (
          <tr key={handle}>
            <td onClick={() => props.history.push(`/product/${handle}`)}>{title}</td>
            <td>{description}</td>
          </tr>
        ))}
        <tr>
          <td colSpan="2" align="center">
            {nextPage.error && <p>Error: {nextPage.error}</p>}
            <button disabled={!hasNextPage} onClick={() => props.getNextPageOfProducts(data[data.length - 1].cursor)}>
              {nextPage.loading ? 'Loading' : nextPage.error ? 'Try Again' : 'LoadMore'}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function mapStateToProps({ products }) {
  return { products };
}

function mapDispatchToProps(dispatch) {
  return {
    getFristPageOfProducts: () => dispatch(getFristPageOfProducts()),
    getNextPageOfProducts: (cursor: string) => dispatch(getNextPageOfProducts(cursor)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList);
