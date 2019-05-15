import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getProduct } from '../../actions';
import VariantSelector from './VariantSelector';

class ProductDetail extends Component<Object, Object> {
  componentWillMount() {
    this.props.getProduct(this.props.match.params.productHandle);
  }

  render() {
    const { loading, error, data } = this.props.product;

    if (loading) return <p>Loading...</p>;

    if (error) return <p>Error: {error.message}</p>;

    let variant = {};
    let variantQuantity = {};

    return (
      <>
        <h1>{data.title}</h1>
        <p>{data.description}</p>
        <img src={data.images.edges[0].node.originalSrc} width={200} alt="" />

        <VariantSelector
          options={data.options}
          variants={data.variants}
          getSelectedVariant={id => {
            console.log(id);
          }}
        />
        <button onClick={() => this.props.addVariantToCart(variant.id, variantQuantity)}>Add to Cart</button>
      </>
    );
  }
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
