import Link from 'next/link';
import React, { ReactElement } from 'react';
import Cart from '../Cart/Cart';

interface Props {
  children;
}

function Layout({ children }: Props): ReactElement {
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
      <Cart />
      <hr />
      <main>{children}</main>
    </>
  );
}

export default Layout;
