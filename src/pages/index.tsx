import { ShopService, GetShopQuery } from '@app/services/shop.service';

interface Props {
  data: GetShopQuery;
}

Page.getInitialProps = async (): Promise<Props> => {
  return { data: await ShopService.getIt() };
};

export default function Page({ data }: Props) {
  return <h1>Home</h1>;
}
