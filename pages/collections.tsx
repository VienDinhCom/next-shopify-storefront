import { withRouter } from 'next/router';
import React from 'react';

interface Props {
  router: {
    query: {
      id: string;
    };
  };
}

function CollectionsPage({ router }: Props) {
  return (
    <>
      <h1>{router.query.id}</h1>
    </>
  );
}

export default withRouter(CollectionsPage);
