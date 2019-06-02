import Link from 'next/link';
import React from 'react';
import Cart from '../Cart/Cart';
import Container from '@material-ui/core/Container';

interface Props {
  children;
}

function Layout({ children }: Props) {
  return (
    <>
      <nav>
        <Link href="/">
          <span>Home</span>
        </Link>
        <Link href="/products">
          <span>Products</span>
        </Link>
      </nav>
      <hr />
      {/* <Cart /> */}
      <hr />
      <Container>{children}</Container>
    </>
  );
}

export default Layout;
