import React, { Component } from 'react';
import { connect } from 'react-redux';
import { removeVariantOutOfCart, updateQuantityOfVariant } from '../../actions';

class Cart extends Component<Object, Object> {
  state = {
    selectedVariant: null,
    variantQuantity: 1,
  };

  render() {
    const { loading, error, data } = this.props.cart;

    if (loading) return <p>Loading...</p>;

    if (error) return <p>Error: {error.message}</p>;

    return (
      <>
        <h1>Cart</h1>
        <ul>
          {data.lineItems &&
            data.lineItems.edges.map(({ node }) => (
              <li key={node.id}>
                {node.title} ({node.variant.title}){' '}
                <input
                  type="number"
                  onChange={event => this.props.dispatch(updateQuantityOfVariant(node.variant.id, event.target.value))}
                  min={1}
                  defaultValue={node.quantity}
                />{' '}
                <button onClick={() => this.props.dispatch(removeVariantOutOfCart(node.variant.id))}>Remove</button>
              </li>
            ))}
        </ul>
      </>
    );
  }
}

function mapStateToProps({ cart }) {
  return { cart };
}

export default connect(mapStateToProps)(Cart);
