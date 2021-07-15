import { ShopService, GetShopQuery } from '@app/services/shop.service';
import { DefaultLayout } from '@app/components/layouts/default-layout';

interface Props {
  data: GetShopQuery;
}

Page.getInitialProps = async (): Promise<Props> => {
  return { data: await ShopService.getIt() };
};

export default function Page({ data }: Props) {
  return <DefaultLayout>Home</DefaultLayout>;
}
