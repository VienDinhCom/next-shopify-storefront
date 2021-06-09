import Link from 'next/link';
import { ShopService, GetShopQuery } from '@app/services/shop.service';
import { DefaultLayout } from '@app/components/layouts/default-layout';

interface Props {
  data: GetShopQuery;
}

Page.getInitialProps = async (): Promise<Props> => {
  return { data: await ShopService.getIt() };
};

export default function Page({ data }: Props) {
  return (
    <DefaultLayout>
      <h1>{data.shop.name}</h1>
      <Link href="/about">
        <a>About</a>
      </Link>
      <Link href="/products">
        <a>Products</a>
      </Link>
    </DefaultLayout>
  );
}
