import React from 'react';
import { useQuery, UseBaseQueryResult } from 'react-query';
import { useRouter } from 'next/router';
import { ShoppingBasket } from '@material-ui/icons';
import {
  Link,
  Badge,
  AppBar,
  Button,
  Toolbar,
  Container,
  IconButton,
  Alert,
  CircularProgress,
} from '@material-ui/core';

import { CartService } from '@app/services/cart.service';
import { CART_ITEM_COUNT_QUERY } from '@app/constants/query.constant';

interface Props {
  query?: UseBaseQueryResult;
  children: React.ReactNode;
}

const DefaultLayout: React.FC<Props> = ({ query, children }) => {
  const router = useRouter();
  const itemCount = useQuery(CART_ITEM_COUNT_QUERY, () => CartService.getItemCount());

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
              <Badge color="error" badgeContent={itemCount.data}>
                <ShoppingBasket />
              </Badge>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      <Container sx={{ padding: { xs: '20px 12px 30px 12px', sm: '20px 24px 30px 24px' } }}>
        {(() => {
          if (query?.isError) {
            return (
              <Alert
                variant="filled"
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => query?.refetch()}>
                    Refetch
                  </Button>
                }
              >
                Could not load the page!
              </Alert>
            );
          }

          if (query?.isFetching) {
            return (
              <div css={{ textAlign: 'center' }}>
                <CircularProgress size={20} />
              </div>
            );
          }

          return children;
        })()}
      </Container>
    </div>
  );
};

export { DefaultLayout };
