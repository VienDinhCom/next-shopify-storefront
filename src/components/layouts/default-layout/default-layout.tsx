import React, { ReactNode } from 'react';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';

import Link from '@material-ui/core/Link';
import Badge from '@material-ui/core/Badge';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import CartIcon from '@material-ui/icons/ShoppingBasket';

import { CartService } from '@app/services/cart.service';

import { CART_ITEM_COUNT_QUERY } from '@app/constants/query.constant';

interface Props {
  children: ReactNode;
}

const DefaultLayout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const itemCount = useQuery(CART_ITEM_COUNT_QUERY, CartService.getItemCount);

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
              color={itemCount.isFetching ? 'warning' : 'inherit'}
              href="/cart"
              onClick={(event) => {
                event.preventDefault();
                router.push('/cart');
              }}
            >
              <Badge color="error" badgeContent={itemCount.data || 0}>
                <CartIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      <Container sx={{ padding: '20px 0 30px 0' }}>{children}</Container>
    </div>
  );
};

export { DefaultLayout };
