import React from 'react';
import Cart from '../components/Cart/Cart';

interface Props {
  router: {
    query: {
      id: string;
    };
  };
}

function CartPage() {
  return <Cart />;
}

export default CartPage;
