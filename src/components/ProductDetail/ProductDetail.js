import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getProduct } from '../../actions';

function ProductDetail(props) {
  useEffect(() => {
    props.getProduct(props.match.params.productHandle);
  }, []);

  const { loading, error, data } = props.product;

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <h1>{data.title}</h1>
      {data.images ? <img src={data.images[0]} width={200} alt="" /> : null}
    </>
  );
}

function mapStateToProps({ product }) {
  return { product };
}

function mapDispatchToProps(dispatch) {
  return {
    getProduct: productId => dispatch(getProduct(productId)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductDetail);
