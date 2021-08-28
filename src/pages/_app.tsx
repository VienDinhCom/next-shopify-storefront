import Head from 'next/head';
import type { AppProps } from 'next/app';
import NextNprogress from 'nextjs-progressbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';

import 'swiper/swiper.min.css';

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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Next Shopify Storefront</title>
      </Head>
      <CssBaseline />
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
      <NextNprogress
        color="#64943E"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        options={{ showSpinner: false }}
      />
    </QueryClientProvider>
  );
}

export default MyApp;
