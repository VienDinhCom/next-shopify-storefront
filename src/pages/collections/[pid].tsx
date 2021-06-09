import { Page as PolarisPage, Layout, Card } from '@shopify/polaris';
import { DefaultLayout } from '@app/components/layouts/default-layout';

export default function Page() {
  return (
    <DefaultLayout>
      <PolarisPage title="Collection">
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
