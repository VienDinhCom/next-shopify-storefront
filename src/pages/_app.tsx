import '@app/assets/style.css';
import { IntlProvider } from 'react-intl';
import ProgressBar from 'nextjs-progressbar';
import { NextAppProps } from '@app/utilities/deps';

export default function App({ Component, pageProps }: NextAppProps) {
  return (
    <IntlProvider locale="en">
      <ProgressBar color="orange" />
      <Component {...pageProps} />
    </IntlProvider>
  );
}
