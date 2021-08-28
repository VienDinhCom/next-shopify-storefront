export namespace IntlService {
  interface CurrencyFormatInput {
    amount: number;
    currencyCode: string;
    locales?: string | string[];
  }

  export function formatPrice(input: CurrencyFormatInput) {
    return new Intl.NumberFormat(input.locales, { style: 'currency', currency: input.currencyCode }).format(
      input.amount
    );
  }
}
