import '@app/assets/style.css';
import ProgressBar from 'nextjs-progressbar';
import { NextAppProps } from '@app/utilities/deps';
import { ShopifyProvider } from '@shopify/hydrogen-react';

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
      <ProgressBar color="orange" />
      <Component {...pageProps} />
    </ShopifyProvider>
  );
}
