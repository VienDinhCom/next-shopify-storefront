import { PageProps, fetchStaticProps } from '@app/utilities/deps';
import { StoreLayout } from '@app/layouts/StoreLayout';
import { ProductListSection, fetchProductListSection } from '@app/sections/ProductListSection';

export const getStaticProps = fetchStaticProps(async () => {
  return {
    props: {
      data: {
        productListSection: await fetchProductListSection(),
      },
    },
    revalidate: 60,
  };
});

export default function Page(props: PageProps<typeof getStaticProps>) {
  return (
    <StoreLayout>
      <ProductListSection data={props.data.productListSection}></ProductListSection>
    </StoreLayout>
  );
}
