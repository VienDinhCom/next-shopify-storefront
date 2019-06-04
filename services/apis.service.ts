import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost';
import 'isomorphic-unfetch';
import config from '../apollo.config';

export const shopify = new ApolloClient({
  link: new HttpLink({
    uri: config.client.service.url,
    headers: config.client.service.headers
  }),
  cache: new InMemoryCache()
});
