import { invariant, fetchServerSideProps, PageProps } from '@app/utilities/deps';
import { StoreLayout } from '@app/layouts/StoreLayout';
import { ProductSingleSection, fetchProductSingleSection } from '@app/sections/ProuctSingleSection';

export const getServerSideProps = fetchServerSideProps(async ({ params }) => {
  invariant(typeof params?.handle === 'string', `params.handle is required`);

  return {
    props: {
      data: {
        productSingleSection: await fetchProductSingleSection(params?.handle),
      },
    },
  };
});

export default function Page(props: PageProps<typeof getServerSideProps>) {
  return (
    <StoreLayout>
      <ProductSingleSection data={props.data.productSingleSection}></ProductSingleSection>
    </StoreLayout>
  );
}
