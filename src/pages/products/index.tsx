import { PageProps, fetchServerSideProps } from '@app/utilities/deps';
import { StoreLayout } from '@app/layouts/StoreLayout';
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
    <StoreLayout>
      <ProductListSection data={props.data.productListSection}></ProductListSection>
    </StoreLayout>
  );
}
