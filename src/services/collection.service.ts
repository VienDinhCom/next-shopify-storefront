import { truncate } from 'lodash';
import formatTitle from 'title';
import { Merge } from 'type-fest';
import { ProductService } from './product.service';
import { ShopifyService, GetCollectionListQueryVariables, GetCollectionListQuery } from './shopify.service';

export namespace CollectionService {
  export interface SingleCollection {
    title: string;
    description: string;
    seo: {
      title: string;
      description: string;
    };
    products: ProductService.List;
  }

  export async function getSingle(handle: string, productsAfter?: string): Promise<SingleCollection> {
    const { collectionByHandle } = await ShopifyService.getCollectionSingle({ handle, productsAfter });

    const { title, description, products } = collectionByHandle!;

    let singleCollection: SingleCollection = {
      title: formatTitle(title),
      description,
      seo: {
        title: formatTitle(title),
        description: truncate(description, { length: 256 }),
      },
      products: ProductService.getListFromPaginatedProductPage(products),
    };

    return singleCollection;
  }

  export interface Collection {
    id: string;
    handle: string;
    title: string;
    url: string;
    description: string;
    image: {
      src: string;
      alt: string;
    };
  }

  export interface CollectionList {
    collections: Merge<Collection, { cursor: string }>[];
    pageInfo: GetCollectionListQuery['collections']['pageInfo'];
  }

  export async function getList(variables?: GetCollectionListQueryVariables): Promise<CollectionList> {
    const {
      collections: { edges, pageInfo },
    } = await ShopifyService.getCollectionList(variables);

    const collections: CollectionList['collections'] = edges.map(({ node, cursor }) => {
      return {
        id: node.id,
        cursor: cursor,
        handle: node.handle,
        url: `/collections/${node.handle}`,
        title: formatTitle(node.title),
        description: node.description,
        image: {
          src: node.image?.transformedSrc ?? '',
          alt: node.image?.altText ?? '',
        },
      };
    });

    return { collections, pageInfo };
  }
}
