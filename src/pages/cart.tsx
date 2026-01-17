import { NextSeo } from "next-seo";

import { StoreLayout } from "@site/layouts/store-layout";
import { CartSection } from "@site/sections/cart-section";

export default function Page() {
  return (
    <StoreLayout>
      <NextSeo title="Cart" />
      <CartSection />
    </StoreLayout>
  );
}
