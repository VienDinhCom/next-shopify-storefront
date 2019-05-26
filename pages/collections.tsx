import { withRouter } from 'next/router';
import React, { ReactElement } from 'react';

function CollectionsPage({ router }: any): ReactElement {
  return (
    <>
      <h1>{router.query.id}</h1>
    </>
  );
}

export default withRouter(CollectionsPage);
