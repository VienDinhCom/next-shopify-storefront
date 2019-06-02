import Button from '@material-ui/core/Button';
import React from 'react';
import { connect } from 'react-redux';
import * as services from '../../services';
import { CheckoutState } from '../../store/checkout.slice';

interface Props {
  checkout?: CheckoutState;
  dispatch?: Function;
}

function Cart(props: Props) {
  const { loading, error, data } = props.checkout;

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <>
      <h1>Cart</h1>
      <Button variant="contained" color="primary">
        Hello World
      </Button>
      <ul>
        {data.lineItems &&
          data.lineItems.edges.map(
            ({ node }) => (
              <li key={node.id}>
                {node.title} ({node.variant.title}){' '}
                <input
                  type="number"
                  onChange={(event) =>
                    props.dispatch(services.checkout.updateQuantity(node.variant.id, parseInt(event.target.value)))
                  }
                  min={1}
                  defaultValue={`${node.quantity}`}
                />{' '}
                <button onClick={() => props.dispatch(services.checkout.removeLineItem(node.variant.id))}>Remove</button>
              </li>
            )
          )}
      </ul>
    </>
  );
}

function mapStateToProps(state) {
  return { checkout: state.checkout };
}

export default connect(mapStateToProps)(Cart);
