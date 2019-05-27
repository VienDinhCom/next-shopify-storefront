import React, { ReactElement } from 'react';
import Link from '../components/Link';

function Index(): ReactElement {
  return (
    <Link
      path="/collections"
      params={{
        id: 'hello'
      }}
    >
      <span>Hello Collections</span>
    </Link>
  );
}

export default Index;
