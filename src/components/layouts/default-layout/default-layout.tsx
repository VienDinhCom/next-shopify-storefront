import React from 'react';
import NextLink from 'next/link';
import NProgress from 'nprogress';
import { ShoppingBasket } from '@material-ui/icons';
import { useQuery, UseBaseQueryResult } from 'react-query';
import { Link, Badge, AppBar, Button, Toolbar, Container, IconButton, Alert } from '@material-ui/core';

import { CartService } from '@app/services/cart.service';
import { CART_ITEM_COUNT_QUERY } from '@app/constants/query.constant';

interface Props {
  query?: UseBaseQueryResult;
  children: React.ReactNode;
}

const DefaultLayout: React.FC<Props> = ({ query, children }) => {
  const itemCount = useQuery(CART_ITEM_COUNT_QUERY, () => CartService.getItemCount());

  React.useEffect(() => {
    if (query?.isFetching) {
      NProgress.start();
    } else {
      NProgress.done(true);
    }
  }, [query?.isFetching]);

  return (
    <div>
      <AppBar position="fixed">
        <Container>
          <Toolbar sx={{ padding: '0px !important' }}>
            <NextLink href="/" passHref>
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
              >
                Next Shopify Storefront
              </Link>
            </NextLink>

            <NextLink href="/products" passHref>
              <Button color="inherit">Products</Button>
            </NextLink>

            <NextLink href="/cart" passHref>
              <IconButton color="inherit">
                <Badge color="error" badgeContent={itemCount.data}>
                  <ShoppingBasket />
                </Badge>
              </IconButton>
            </NextLink>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      <Container sx={{ padding: { xs: '20px 12px 30px 12px', sm: '20px 24px 30px 24px' } }}>
        {(() => {
          if (query) {
            if (query.isError) {
              return (
                <Alert
                  sx={{ marginBottom: '20px' }}
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

            return query.isSuccess ? children : '';
          } else {
            return children;
          }
        })()}
      </Container>
    </div>
  );
};

export { DefaultLayout };
