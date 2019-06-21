import React from 'react';
import TextField from '@material-ui/core/TextField';

interface Props {
  getQuantity: (quantity: number) => void;
  className?: string;
}

function QuantityInput({ getQuantity, className }: Props) {
  return (
    <TextField
      className={className}
      id="product-quantity"
      label="Quantity"
      type="number"
      defaultValue={1}
      onChange={event => getQuantity(parseInt(event.target.value))}
    />
  );
}

export default QuantityInput;
