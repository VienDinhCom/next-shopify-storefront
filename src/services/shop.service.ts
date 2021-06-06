import { useQuery } from 'react-query';
import { SHOP_QUERY } from '@app/constants/query.constant';
import { ShopifyService } from './shopify.service';

export namespace ShopService {
  export function getIt() {
    return ShopifyService.getShop();
  }

  export function useIt() {
    return useQuery([SHOP_QUERY], getIt);
  }
}

export * from './shopify/generated';
