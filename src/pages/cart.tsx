import { NextSeo } from 'next-seo';
import NextLink from 'next/link';
import { useQuery } from 'react-query';
import { Alert, Button } from '@material-ui/core';
import { Cart } from '@app/components/sections/cart';
import { DefaultLayout } from '@app/components/layouts/default-layout';
import { CartService } from '@app/services/cart.service';
import { CART_QUERY } from '@app/constants/query.constant';

export default function Page() {
  const cart = useQuery(CART_QUERY, () => {
    return CartService.getCart();
  });

  return (
    <DefaultLayout query={cart}>
      <NextSeo title="Cart" description="Your Shopping Cart" />

      {(() => {
        if (cart.data?.items.length) {
          return <Cart cart={cart.data} />;
        }

        return (
          <Alert
            variant="filled"
            severity="warning"
            action={
              <NextLink href="/products" passHref>
                <Button color="inherit" size="small">
                  Shop Now
                </Button>
              </NextLink>
            }
          >
            Your Cart is empty.
          </Alert>
        );
      })()}
    </DefaultLayout>
  );
}
