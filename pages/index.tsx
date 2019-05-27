import React, { ReactElement } from 'react';
import Link from '../components/Link';

function Index(): ReactElement {
  return (
    <Link
      path="/products"
      params={{
        id: 'hello'
      }}
    >
      <span>Product: Hello</span>
    </Link>
  );
}

export default Index;
