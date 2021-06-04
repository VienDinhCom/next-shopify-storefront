import Link from 'next/link';
import { shopService, GetShopQuery } from '@app/services/shop.service';

interface Props {
  data: GetShopQuery;
}

export default function Page({ data }: Props) {
  return (
    <div>
      <h1>{data.shop.name}</h1>
      <Link href="/about">
        <a>About</a>
      </Link>
    </div>
  );
}

Page.getInitialProps = async () => {
  return { data: await shopService.get() };
};
