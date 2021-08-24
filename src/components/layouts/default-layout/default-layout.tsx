import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import Badge from '@material-ui/core/Badge';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import CartIcon from '@material-ui/icons/ShoppingBasket';

interface Props {
  children: ReactNode;
}

const DefaultLayout: React.FC<Props> = ({ children }) => {
  const router = useRouter();

  return (
    <div>
      <AppBar position="fixed">
        <Container>
          <Toolbar sx={{ padding: '0px !important' }}>
            <Link
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                display: 'block',
                color: '#fff',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              href="/"
              onClick={(event) => {
                event.preventDefault();
                router.push('/');
              }}
            >
              Next Shopify Storefront
            </Link>
            <Button
              color="inherit"
              href="/products"
              onClick={(event) => {
                event.preventDefault();
                router.push('/products');
              }}
            >
              Products
            </Button>
            <IconButton
              color="inherit"
              href="/cart"
              onClick={(event) => {
                event.preventDefault();
                router.push('/cart');
              }}
            >
              <Badge color="error" badgeContent={1}>
                <CartIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar sx={{ marginBottom: '20px' }} />
      <Container>{children}</Container>
    </div>
  );
};

export { DefaultLayout };
