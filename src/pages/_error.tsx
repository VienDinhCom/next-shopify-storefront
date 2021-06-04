import { envService } from '@app/services/env.service';

export default function Error({ isServer }) {
  if (isServer) {
    return <h1>Error: Server</h1>;
  }

  return <h1>Error: Client</h1>;
}

Error.getInitialProps = ({ err }) => {
  return { isServer: envService.isServer() };
};
