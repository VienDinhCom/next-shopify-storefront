import '@app/assets/style.css';
import ProgressBar from 'nextjs-progressbar';
import { NextAppProps } from '@app/utilities/deps';
import { ShopifyProvider, CartProvider } from '@shopify/hydrogen-react';

import { storeDomain, publicStorefrontToken, storefrontApiVersion } from '@app/utilities/storefront';

export default function App({ Component, pageProps }: NextAppProps) {
  return (
    <ShopifyProvider
      languageIsoCode="EN"
      countryIsoCode="US"
      storeDomain={storeDomain}
      storefrontToken={publicStorefrontToken}
      storefrontApiVersion={storefrontApiVersion}
    >
      <CartProvider>
        <ProgressBar color="orange" />
        <Component {...pageProps} />
      </CartProvider>
    </ShopifyProvider>
  );
}
