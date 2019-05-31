import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import * as services from '../../services';
import Button from '@material-ui/core/Button';

function Cart(props: any): ReactElement {
  const { loading, error, item } = props.checkout;

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <h1>Cart</h1>
      <Button variant="contained" color="primary">
        Hello World
      </Button>
      <ul>
        {item.lineItems &&
          item.lineItems.edges.map(
            ({ node }): ReactElement => (
              <li key={node.id}>
                {node.title} ({node.variant.title}){' '}
                <input
                  type="number"
                  onChange={(event): void =>
                    props.dispatch(services.checkout.updateQuantity(node.variant.id, parseInt(event.target.value)))
                  }
                  min={1}
                  defaultValue={node.quantity}
                />{' '}
                <button onClick={(): void => props.dispatch(services.checkout.removeLineItem(node.variant.id))}>
                  Remove
                </button>
              </li>
            )
          )}
      </ul>
    </>
  );
}

function mapStateToProps({ checkout }: object): object {
  return { checkout };
}

export default connect(mapStateToProps)(Cart);
