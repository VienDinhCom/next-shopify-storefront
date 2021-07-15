import { InfiniteData } from 'react-query';
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
  const productList = ProductService.useList({ options: { initialData } });

  return <DefaultLayout>Products</DefaultLayout>;
}
