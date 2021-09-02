import { NextSeo } from 'next-seo';
import { NextPageContext } from 'next';
import { DefaultLayout } from '@app/components/layouts/default-layout/default-layout';
import { ProductService } from '@app/services/product.service';
import { ProductSingle } from '@app/components/sections/product-single';

interface Props {
  product: ProductService.Single;
}

Page.getInitialProps = async ({ query }: NextPageContext): Promise<Props> => {
  const handle = query.pid as string;
  const product = await ProductService.getSingle(handle);

  return { product };
};

export default function Page({ product }: Props) {
  return (
    <DefaultLayout>
      <NextSeo title={product.seo.title} description={product.seo.description} />
      <ProductSingle product={product} />
    </DefaultLayout>
  );
}
