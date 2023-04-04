import { ReactNode } from '@app/utilities/deps';
import { Header } from '@app/sections/Header/Header';

interface Props {
  children: ReactNode;
}

export function StoreLayout(props: Props) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl p-6 lg:px-8">{props.children}</main>
    </>
  );
}
