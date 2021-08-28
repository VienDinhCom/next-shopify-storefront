import { ProductListProps } from '@app/components/sections/product-list';
import { ShopifyService, GetProductListQueryVariables, GetProductSingleQueryVariables } from './shopify.service';

export namespace ProductService {
  export function getSingle(handle: GetProductSingleQueryVariables['handle']) {
    return ShopifyService.getProductSingle({ handle });
  }

  export async function getList(variables?: GetProductListQueryVariables) {
    const {
      products: { edges, pageInfo },
    } = await ShopifyService.getProductList(variables);

    type Product = ProductListProps['products'][0];

    interface ProductItem extends Product {
      cursor: string;
    }

    const products: ProductItem[] = edges.map(({ node, cursor }) => {
      return {
        id: node.id,
        cursor: cursor,
        handle: node.handle,
        title: node.title,
        description: node.description,
        image: {
          src: node.images.edges[0].node.transformedSrc,
          alt: node.images.edges[0].node.altText || '',
        },
        price: {
          amount: node.priceRange.minVariantPrice.amount,
          currencyCode: node.priceRange.minVariantPrice.currencyCode,
        },
      };
    });

    return { products, pageInfo };
  }
}

export * from './shopify/generated';
