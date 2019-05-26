import Link from 'next/link';
import React, { ReactElement } from 'react';

function LinkAs({ path, param, value, children }: any): ReactElement {
  return (
    <Link as={`${path}/${value}`} href={`${path}?${param}=${value}`}>
      {children}
    </Link>
  );
}

function Index(): ReactElement {
  return (
    <LinkAs path="/collections" param="id" value="Hello">
      <span>Hello Collections</span>
    </LinkAs>
  );
}

export default Index;
