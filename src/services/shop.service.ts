import { ShopifyService } from './shopify.service';

export namespace ShopService {
  export function get() {
    return ShopifyService.getShop();
  }
}

export * from './shopify/generated';
