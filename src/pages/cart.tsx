import { NextSeo } from '@site/utilities/deps';
import { StoreLayout } from '@site/layouts/StoreLayout';
import { CartSection } from '@site/sections/CartSection';

export default function Page() {
  return (
    <StoreLayout>
      <NextSeo title="Cart" />
      <CartSection />
    </StoreLayout>
  );
}
