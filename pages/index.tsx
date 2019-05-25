import React from 'react';
import Link from 'next/link';

function LinkAs({ path, param, value, children }: any) {
  return (
    <Link as={`${path}/${value}`} href={`${path}?${param}=${value}`}>
      {children}
    </Link>
  );
}

const Index = () => (
  <LinkAs path="/collections" param="id" value="Hello">
    <span>Hello Collections</span>
  </LinkAs>
);

export default Index;
