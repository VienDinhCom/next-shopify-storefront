import { NextPageContext } from 'next';
import { DefaultLayout } from '@app/components/layouts/default-layout/default-layout';
import { ProductService, GetProductSingleQuery } from '@app/services/product.service';
import { ProductSingle, ProductSingleProps } from '@app/components/sections/product-single';

interface Props {
  data: GetProductSingleQuery;
}

Page.getInitialProps = async ({ query }: NextPageContext): Promise<Props> => {
  const handle = query.pid as string;

  const data = await ProductService.getSingle({
    variables: { handle },
  });

  return { data };
};

export default function Page({ data }: Props) {
  const { title, description, variants } = data.productByHandle!;

  const product: ProductSingleProps = {
    title,
    description,
    variants: variants.edges.map(({ node }) => {
      return {
        id: node.id,
        title: node.title,
        price: {
          amount: node.priceV2.amount,
          currencyCode: node.priceV2.currencyCode as string,
        },
        image: node.image
          ? {
              src: node.image?.transformedSrc!,
              alt: node.image?.altText || '',
            }
          : undefined,
      };
    }),
  };

  return (
    <DefaultLayout>
      <ProductSingle {...product} />
    </DefaultLayout>
  );
}
