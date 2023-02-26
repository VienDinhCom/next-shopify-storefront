import { ReactNode } from '@app/utilities/deps';

interface Props {
  children: ReactNode;
}

export function DefaultLayout(props: Props) {
  return (
    <main>
      <h1>Default Layout</h1>
      {props.children}
    </main>
  );
}
