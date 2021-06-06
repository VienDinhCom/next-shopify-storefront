import { useQuery } from 'react-query';
import { ShopifyService } from './shopify.service';

export namespace ShopService {
  export function getIt() {
    return ShopifyService.getShop();
  }

  export function useIt() {
    return useQuery('shop', getIt);
  }
}

export * from './shopify/generated';
