import { NextPageContext } from 'next';
import { Cart } from '@app/components/sections/cart';
import { DefaultLayout } from '@app/components/layouts/default-layout';
import { CartService } from '@app/services/cart.service';

interface Props {
  cart?: CartService.Cart;
}

Page.getInitialProps = async (context: NextPageContext): Promise<Props> => {
  const cart = await CartService.getCart(context);

  return { cart };
};

export default function Page({ cart }: Props) {
  return <DefaultLayout>{cart && <Cart cart={cart}></Cart>}</DefaultLayout>;
}
