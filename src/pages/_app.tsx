import '@app/assets/style.css';
import { AppProps } from '@app/utilities/deps';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
