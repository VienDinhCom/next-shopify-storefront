import { Page as PolarisPage, Layout, Card } from '@shopify/polaris';
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
      <PolarisPage title={data.shop.name}>
        <Layout>
          <Layout.Section>
            <Card sectioned>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis quas assumenda magnam recusandae, nemo
              temporibus adipisci debitis provident necessitatibus illum expedita facere vel ratione dolorem eum atque
              tenetur blanditiis reiciendis?
            </Card>
          </Layout.Section>
        </Layout>
      </PolarisPage>
    </DefaultLayout>
  );
}
