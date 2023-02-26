import { ReactNode } from '@app/utilities/deps';
import { Header } from '@app/sections/Header';

interface Props {
  children: ReactNode;
}

export function DefaultLayout(props: Props) {
  return (
    <main>
      <Header />
      {/* {props.children} */}
    </main>
  );
}
