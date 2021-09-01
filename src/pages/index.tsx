import { DefaultLayout } from '@app/components/layouts/default-layout';
import { Welcome } from '@app/components/sections/welcome';

export default function Page() {
  return (
    <DefaultLayout>
      <Welcome />
    </DefaultLayout>
  );
}
