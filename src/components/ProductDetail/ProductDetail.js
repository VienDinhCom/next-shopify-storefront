import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getProduct } from '../../actions';
import VariantSelector from './VariantSelector';

class ProductDetail extends Component<Object, Object> {
  state = {
    selectedVariant: null,
    variantQuantity: 1,
  };
  componentWillMount() {
    this.props.getProduct(this.props.match.params.productHandle);
  }

  render() {
    const { loading, error, data } = this.props.product;
    const { selectedVariant, variantQuantity } = this.state;

    if (loading) return <p>Loading...</p>;

    if (error) return <p>Error: {error.message}</p>;

    return (
      <>
        <h1>{data.title}</h1>
        <p>{data.description}</p>
        {data.images.edges[0] && <img src={data.images.edges[0].node.originalSrc} width={200} alt="" />}

        <VariantSelector
          options={data.options}
          variants={data.variants}
          getSelectedVariant={id => this.setState({ selectedVariant: id })}
        />

        <label className="Product__option">
          Quantity
          <input
            min="1"
            type="number"
            value={variantQuantity}
            onChange={event => this.setState({ variantQuantity: event.target.value })}
          />
        </label>

        <br />

        <button onClick={() => this.props.addVariantToCart(selectedVariant, variantQuantity)}>Add to Cart</button>
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
