import { invariant, fetchServerSideProps, PageProps } from '@app/utilities/deps';
import { DefaultLayout } from '@app/layouts/DefaultLayout/DefaultLayout';
import { ProductSingleSection, fetchProductSingleSection } from '@app/sections/ProuctSingleSection';

export const getServerSideProps = fetchServerSideProps(async ({ params }) => {
  invariant(typeof params?.handle === 'string', `params.handle is required`);

  return {
    props: {
      data: {
        productSingle: await fetchProductSingleSection(params?.handle),
      },
    },
  };
});

export default function Page(props: PageProps<typeof getServerSideProps>) {
  return (
    <DefaultLayout>
      <ProductSingleSection data={props.data.productSingle}></ProductSingleSection>
    </DefaultLayout>
  );
}
