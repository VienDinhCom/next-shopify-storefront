import ReactGA from 'react-ga';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID;

export namespace AnalyticUtility {
  export function initialize() {
    if (TRACKING_ID) {
      ReactGA.initialize(TRACKING_ID);
    }
  }

  export function pageview() {
    if (TRACKING_ID) {
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }

  export function useTracker() {
    const router = useRouter();

    useEffect(() => {
      initialize();
      pageview();
    }, []);

    useEffect(() => {
      router.events.on('routeChangeComplete', pageview);

      return () => {
        router.events.off('routeChangeComplete', pageview);
      };
    }, [router]);
  }
}
