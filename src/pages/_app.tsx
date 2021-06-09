import NextNprogress from 'nextjs-progressbar';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';

import '@shopify/polaris/dist/styles.css';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

import { EnvService } from '@app/services/env.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: EnvService.isProd(),
      refetchIntervalInBackground: EnvService.isProd(),
      refetchOnWindowFocus: EnvService.isProd(),
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider i18n={enTranslations}>
        <Component {...pageProps} />
      </AppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <NextNprogress color="#29D" startPosition={0.3} stopDelayMs={200} height={3} />
    </QueryClientProvider>
  );
}

export default MyApp;
