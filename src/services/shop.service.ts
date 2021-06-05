import { shopifyService } from './shopify.service';

export namespace shopService {
  export function get() {
    return shopifyService.getShop();
  }
}

export * from './shopify/generated';
