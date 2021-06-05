import { useQuery } from 'react-query';
import { ShopifyService } from './shopify.service';

export namespace ShopService {
  export function getData() {
    return ShopifyService.getShop();
  }

  export function useData() {
    return useQuery('shop', getData);
  }
}

export * from './shopify/generated';
