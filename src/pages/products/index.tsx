import { InfiniteData } from 'react-query';
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

  return <h1>Product List</h1>;
}
