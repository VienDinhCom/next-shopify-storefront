import { InfiniteData } from 'react-query';
import { DefaultLayout } from '@app/components/layouts/default-layout/default-layout';
import { ProductService, GetProductListQuery } from '@app/services/product.service';
import { ProductList, ProductListProps } from '@app/components/sections/product-list';

interface Props {
  initialData: InfiniteData<GetProductListQuery>;
}

Page.getInitialProps = async (): Promise<Props> => {
  const firstPage = await ProductService.getList();

  return {
    initialData: { pages: [firstPage], pageParams: [null] },
  };
};

export default function Page({ initialData }: Props) {
  const productList = ProductService.useList({ options: { initialData } });

  const products: ProductListProps['products'] = productList.data!.pages.flatMap((page) => {
    return page.products.edges.map((product) => {
      return {
        id: product.node.id,
        handle: product.node.handle,
        title: product.node.title,
        description: product.node.description,
        image: {
          src: product.node.images.edges[0].node.transformedSrc as string,
          alt: product.node.images.edges[0].node.altText || '',
        },
        price: {
          amount: product.node.priceRange.minVariantPrice.amount,
          currencyCode: product.node.priceRange.minVariantPrice.currencyCode,
        },
      };
    });
  });

  return (
    <DefaultLayout>
      <ProductList products={products} pagination={productList} />
    </DefaultLayout>
  );
}
