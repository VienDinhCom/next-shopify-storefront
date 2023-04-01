import { DefaultLayout } from '@app/layouts/DefaultLayout/DefaultLayout';
import { GetServerSideProps, invariant } from '@app/utilities/deps';

import { ProductSingle } from '@app/sections/ProductSingle/ProductSingle';
import { getProductSingle, GetProductSingleOutput } from '@app/sections/ProductSingle/ProductSingle.service';

interface Props {
  productSingle: GetProductSingleOutput;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  invariant(typeof params?.handle === 'string', `params.handle is required`);

  return {
    props: {
      productSingle: await getProductSingle(params?.handle),
    },
  };
};

export default function Page(props: Props) {
  return (
    <DefaultLayout>
      <ProductSingle productSingle={props.productSingle}></ProductSingle>
    </DefaultLayout>
  );
}
