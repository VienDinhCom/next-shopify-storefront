export namespace IntlService {
  interface Price {
    amount: number;
    currencyCode: string;
    locales?: string | string[];
  }

  export function formatPrice(price: Price) {
    return new Intl.NumberFormat(price.locales, { style: 'currency', currency: price.currencyCode }).format(
      price.amount
    );
  }
}
