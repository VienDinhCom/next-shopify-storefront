import React from 'react';

interface Props {
  getQuantity: (quantity: number) => void;
}

function QuantityInput({ getQuantity }: Props) {
  return (
    <label>
      Quantity
      <input min="1" type="number" defaultValue="1" onChange={event => getQuantity(parseInt(event.target.value))} />
    </label>
  );
}

export default QuantityInput;
