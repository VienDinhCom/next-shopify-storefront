import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import NextNprogress from 'nextjs-progressbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';

import 'swiper/swiper.min.css';

import { EnvUtility } from '@app/utilities/env.utility';
import { AnalyticUtility } from '@app/utilities/analytic.utility';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: EnvUtility.isProd(),
      refetchIntervalInBackground: EnvUtility.isProd(),
      refetchOnWindowFocus: EnvUtility.isProd(),
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  AnalyticUtility.useTracker();

  return (
    <QueryClientProvider client={queryClient}>
      <DefaultSeo
        defaultTitle="Next Shopify Storefront"
        titleTemplate="%s • Next Shopify Storefront"
        description="🛍 A Shopping Cart built with TypeScript, Emotion, Next.js, React.js, React Query, Shopify Storefront GraphQL API, ... and Material UI."
      />
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
