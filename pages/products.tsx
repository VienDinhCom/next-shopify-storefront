import { withRouter } from 'next/router';
import React, { ReactElement } from 'react';

function ProductsPage({ router }: any): ReactElement {
  return (
    <>
      <h1>{router.query.id}</h1>
    </>
  );
}

export default withRouter(ProductsPage);
