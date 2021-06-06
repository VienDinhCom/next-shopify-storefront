import { EnvService } from '@app/services/env.service';

interface Props {
  isNode: boolean;
}

Page.getInitialProps = async (): Promise<Props> => {
  return { isNode: EnvService.isNode() };
};

export default function Page({ isNode }: Props) {
  if (isNode) {
    return <h1>Error: Server</h1>;
  }

  return <h1>Error: Client</h1>;
}
