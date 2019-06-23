import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost';
import 'isomorphic-unfetch';
import config from '../apollo.config';

export const shopify = new ApolloClient({
  ssrMode: true,
  link: new HttpLink({
    uri: config.client.service.url,
    headers: config.client.service.headers
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore'
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
});
