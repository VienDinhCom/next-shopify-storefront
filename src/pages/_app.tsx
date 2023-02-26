import '@app/assets/style.css';
import { NextAppProps } from '@app/utilities/deps';

export default function App({ Component, pageProps }: NextAppProps) {
  return <Component {...pageProps} />;
}
