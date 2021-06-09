import { InfiniteData } from 'react-query';
import { ProductList } from '@app/components/lists/product-list';
import { Page as PolarisPage, Layout, Card } from '@shopify/polaris';
import { DefaultLayout } from '@app/components/layouts/default-layout';
import { ProductService, GetProductListQuery } from '@app/services/product.service';

interface Props {
  initialData: InfiniteData<GetProductListQuery>;
}

Page.getInitialProps = async (): Promise<Props> => {
  const firstPage = await ProductService.getList();

  return {
    initialData: { pages: [firstPage], pageParams: [null] },
  };
};

export default function Page({ initialData }: Props) {
  const productList = ProductService.useList({ options: { initialData, refetchOnMount: false } });

  return (
    <DefaultLayout>
      <PolarisPage title="Products">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <ProductList {...productList} />
            </Card>
          </Layout.Section>
        </Layout>
      </PolarisPage>
    </DefaultLayout>
  );
}
