import Link from 'next/link';
import { shopService, GetShopQuery } from '@app/services/shop.service';

interface Props {
  data: GetShopQuery;
  error: Error;
}

export default function Page({ data, error }: Props) {
  if (error) return <p>Error: {error.message}</p>;

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
  return shopService
    .get()
    .then((data) => ({ data }))
    .catch((error) => ({ error }));
};
