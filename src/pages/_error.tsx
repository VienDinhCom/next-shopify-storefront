import { EnvService } from '@app/services/env.service';

interface Props {
  isServer: boolean;
}

Page.getInitialProps = async (): Promise<Props> => {
  return { isServer: EnvService.isServer() };
};

export default function Page({ isServer }) {
  if (isServer) {
    return <h1>Error: Server</h1>;
  }

  return <h1>Error: Client</h1>;
}
