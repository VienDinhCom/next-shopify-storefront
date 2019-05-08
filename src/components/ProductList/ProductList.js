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
    <ul>
      {data.map(({ id, title }) => (
        <li key={id}>{title}</li>
      ))}
    </ul>
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
