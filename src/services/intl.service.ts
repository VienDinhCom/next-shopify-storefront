import { CurrencyCode } from '@app/services/shopify.service';
export namespace IntlService {
  interface Price {
    amount: number;
    currencyCode: CurrencyCode;
    locales?: string | string[];
  }

  export function formatPrice({ amount, currencyCode, locales }: Price): string {
    return new Intl.NumberFormat(locales, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  }
}
