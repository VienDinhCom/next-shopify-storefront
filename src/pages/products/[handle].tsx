import { DefaultLayout } from '@app/layouts/DefaultLayout';
import { GetServerSideProps, invariant } from '@app/utils/deps';
import { AsyncReturnType } from '@app/utils/types';

import { ProductSingle } from '@app/sections/ProductSingle/ProductSingle';
import { getProductSingle } from '@app/sections/ProductSingle/ProductSingle.service';

interface Props {
  productSingle: AsyncReturnType<typeof getProductSingle>;
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
