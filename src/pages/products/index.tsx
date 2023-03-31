import { AsyncReturnType } from '@app/utils/types';
import { GetServerSideProps } from '@app/utils/deps';
import { DefaultLayout } from '@app/layouts/DefaultLayout';
import { getProductList, ProductList } from '@app/sections/ProductList';

interface Props {
  productList: AsyncReturnType<typeof getProductList>;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return {
    props: {
      productList: await getProductList(),
    },
  };
};

export default function Page(props: Props) {
  return (
    <DefaultLayout>
      <ProductList productList={props.productList}></ProductList>
    </DefaultLayout>
  );
}
