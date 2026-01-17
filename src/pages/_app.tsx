import "@site/assets/style.css";

import type { AppProps as NextAppProps } from "next/app";

import { CartProvider, ShopifyProvider } from "@shopify/hydrogen-react";
import { DefaultSeo } from "next-seo";
import ProgressBar from "nextjs-progressbar";

import { env } from "@site/utilities/env";

export default function App({ Component, pageProps }: NextAppProps) {
  return (
    <ShopifyProvider
      languageIsoCode="EN"
      countryIsoCode="US"
      storeDomain={env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}
      storefrontToken={env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN}
      storefrontApiVersion={env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION}
    >
      <DefaultSeo
        defaultTitle="Next Shopify Storefront"
        titleTemplate="%s • Next Shopify Storefront"
        description="🛍 A Shopping Cart built with TypeScript, Tailwind CSS, Headless UI, Next.js, React.js, Shopify Hydrogen React,... and Shopify Storefront GraphQL API."
      />
      <CartProvider>
        <ProgressBar color="orange" />
        <Component {...pageProps} />
      </CartProvider>
    </ShopifyProvider>
  );
}
