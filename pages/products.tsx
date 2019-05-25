import React from 'react';
import { withRouter } from 'next/router';

function ProductsPage({ router }: any) {
  return (
    <>
      <h1>{router.query.id}</h1>
    </>
  );
}

export default withRouter(ProductsPage);
