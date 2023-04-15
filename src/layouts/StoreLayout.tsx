import { ReactNode } from '@site/utilities/deps';
import { HeaderSection } from '@site/sections/HeaderSection';

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
