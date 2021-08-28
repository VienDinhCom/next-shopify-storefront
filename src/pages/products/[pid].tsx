import { NextPageContext } from 'next';
import { DefaultLayout } from '@app/components/layouts/default-layout/default-layout';
import { ProductService, GetProductSingleQuery } from '@app/services/product.service';
import { ProductSingle, ProductSingleProps } from '@app/components/sections/product-single';

interface Props {
  data: GetProductSingleQuery;
}

Page.getInitialProps = async ({ query }: NextPageContext): Promise<Props> => {
  const handle = query.pid as string;

  const data = await ProductService.getSingle(handle);

  return { data };
};

export default function Page({ data }: Props) {
  const { title, description, images, variants } = data.productByHandle!;

  const product: ProductSingleProps = {
    title,
    description,
    images: images.edges.map(({ node }) => {
      return {
        id: node.id as string,
        src: node.transformedSrc,
        alt: node.altText || '',
      };
    }),
    variants: variants.edges.map(({ node }) => {
      const variant: ProductSingleProps['variants'][0] = {
        id: node.id,
        title: node.title,
        image: node.image?.id!,
        price: {
          amount: node.priceV2.amount,
          currencyCode: node.priceV2.currencyCode as string,
        },
      };

      return variant;
    }),
  };

  return (
    <DefaultLayout>
      <ProductSingle {...product} />
    </DefaultLayout>
  );
}
