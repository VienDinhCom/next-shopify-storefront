import { NextSeo } from 'next-seo';
import { useQuery } from 'react-query';
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
      <Cart cart={cart.data!} />
    </DefaultLayout>
  );
}
