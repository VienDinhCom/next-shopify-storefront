import App from 'next/app';
import { withMuiApp } from '../hocs/withMui';
import withRedux from '../hocs/withRedux';
import services from '../services';
import isServer from 'detect-node';

class MyApp extends App {
  public static async getInitialProps({ Component, ctx }) {
    const { req, res, store } = ctx;
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

    if (isServer) await store.dispatch(services.checkout.fetch(req, res));

    return { pageProps };
  }
}

export default withRedux(withMuiApp(MyApp));
