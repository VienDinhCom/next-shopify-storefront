import { truncate } from 'lodash';
import formatTitle from 'title';
import { Merge } from 'type-fest';
import { ProductService } from './product.service';
import { ShopifyService, GetCollectionsQueryVariables, GetCollectionsQuery } from './shopify.service';

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

  export async function getCollection(handle: string, after?: string): Promise<SingleCollection> {
    const { collection } = await ShopifyService.getCollection({ handle, after });

    const { title, description, seo, products } = collection!;

    let singleCollection: SingleCollection = {
      title: formatTitle(title),
      description,
      seo: {
        title: formatTitle(seo.title || title),
        description: seo.description || truncate(description, { length: 256 }),
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
    pageInfo: GetCollectionsQuery['collections']['pageInfo'];
  }

  export async function getCollections(variables?: GetCollectionsQueryVariables): Promise<CollectionList> {
    const {
      collections: { edges, pageInfo },
    } = await ShopifyService.getCollections(variables);

    const collections: CollectionList['collections'] = edges.map(({ node, cursor }) => {
      return {
        id: node.id,
        cursor: cursor,
        handle: node.handle,
        url: `/collections/${node.handle}`,
        title: formatTitle(node.title),
        description: node.description,
        image: {
          src: node.image?.url ?? '',
          alt: node.image?.altText ?? '',
        },
      };
    });

    return { collections, pageInfo };
  }
}
