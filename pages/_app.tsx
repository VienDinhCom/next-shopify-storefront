import App from 'next/app';
import { withMuiApp } from '../hocs/withMui';
import withRedux from '../hocs/withRedux';
import * as services from '../services';

class MyApp extends App {
  public static async getInitialProps({ Component, ctx }) {
    const { req, res, store } = ctx;
    const isServer = res;
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

    if (isServer) await store.dispatch(services.checkout.fetch(req, res));

    return { pageProps };
  }
}

export default withRedux(withMuiApp(MyApp));
