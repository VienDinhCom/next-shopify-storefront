import { PageProps, fetchServerSideProps } from '@app/utilities/deps';
import { DefaultLayout } from '@app/layouts/DefaultLayout/DefaultLayout';
import { ProductListSection, fetchProductListSection } from '@app/sections/ProductListSection';

export const getServerSideProps = fetchServerSideProps(async () => {
  return {
    props: {
      data: {
        productListSection: await fetchProductListSection(),
      },
    },
  };
});

export default function Page(props: PageProps<typeof getServerSideProps>) {
  return (
    <DefaultLayout>
      <ProductListSection data={props.data.productListSection}></ProductListSection>
    </DefaultLayout>
  );
}
