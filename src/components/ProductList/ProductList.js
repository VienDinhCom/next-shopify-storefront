import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getProductList } from '../../actions';

function ProductList(props) {
  useEffect(() => {
    props.getProductList();
  }, []);

  return (
    <>
      {props.productList.data ? (
        <ul>
          {props.productList.data.map(({ id, title }) => (
            <li key={id}>{title}</li>
          ))}
        </ul>
      ) : null}
    </>
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
