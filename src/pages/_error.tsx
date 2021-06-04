import { envService } from '@app/services/env.service';

export default function Page({ isServer }) {
  if (isServer) {
    return <h1>Error: Server</h1>;
  }

  return <h1>Error: Client</h1>;
}

Page.getInitialProps = () => {
  return { isServer: envService.isServer() };
};
