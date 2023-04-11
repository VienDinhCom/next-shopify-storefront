import { StoreLayout } from '@app/layouts/StoreLayout';
import { CartSection } from '@app/sections/CartSection';

export default function Page() {
  return (
    <StoreLayout>
      <CartSection></CartSection>
    </StoreLayout>
  );
}
