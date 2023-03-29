import '@app/assets/style.css';
import ProgressBar from 'nextjs-progressbar';
import { NextAppProps } from '@app/utils/deps';

export default function App({ Component, pageProps }: NextAppProps) {
  return (
    <>
      <ProgressBar color="orange" />
      <Component {...pageProps} />
    </>
  );
}
