import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getProductList } from '../../actions';

function ProductList(props) {
  useEffect(() => {
    props.getProductList();
  }, []);

  const { loading, error, data } = props.productList;

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <td>Handle</td>
          <td style={{ width: 200 }}>Title</td>
          <td>Description</td>
        </tr>
      </thead>
      <tbody>
        {data.map(({ handle, title, description }) => (
          <tr key={handle}>
            <td>{handle}</td>
            <td onClick={() => props.history.push(`/product/${handle}`)}>
              {title}
            </td>
            <td>{description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function mapStateToProps({ productList }) {
  return { productList };
}

function mapDispatchToProps(dispatch) {
  return {
    getProductList: () => dispatch(getProductList()),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList);
