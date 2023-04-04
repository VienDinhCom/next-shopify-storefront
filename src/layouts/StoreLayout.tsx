import { ReactNode } from '@app/utilities/deps';
import { HeaderSection } from '@app/sections/HeaderSection';

interface Props {
  children: ReactNode;
}

export function StoreLayout(props: Props) {
  return (
    <>
      <HeaderSection />
      <main className="mx-auto max-w-7xl p-6 lg:px-8">{props.children}</main>
    </>
  );
}
