import React from 'react';
import { withRouter } from 'next/router';

function CollectionsPage({ router }: any) {
  return (
    <>
      <h1>{router.query.id}</h1>
    </>
  );
}

export default withRouter(CollectionsPage);
