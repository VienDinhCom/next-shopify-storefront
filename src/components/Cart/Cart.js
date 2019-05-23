import React, { Component } from 'react';
import { connect } from 'react-redux';

class Cart extends Component<Object, Object> {
  state = {
    selectedVariant: null,
    variantQuantity: 1,
  };
  componentWillMount() {}

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
                {node.title} <input type="number" min={1} value={node.quantity} />
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
