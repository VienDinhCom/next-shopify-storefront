import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost';

export default new ApolloClient({
  link: new HttpLink({
    uri: 'https://maxvien-dev.myshopify.com/api/graphql',
    headers: {
      'X-Shopify-Storefront-Access-Token': 'cb21e7484c255b384b9128ac6b696693',
    },
  }),
  cache: new InMemoryCache(),
});
