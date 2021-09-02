import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import NextNprogress from 'nextjs-progressbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';

import 'swiper/swiper.min.css';

import { EnvService } from '@app/services/env.service';
import { AnalyticService } from '@app/services/analytic.service';

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
  AnalyticService.useTracker();

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
