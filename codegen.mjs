import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const publicStorefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN;
const storefrontApiVersion = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION;

const apiEndpoint = storeDomain + `/api/${storefrontApiVersion}/graphql.json`;

execSync(
  `node_modules/.bin/zeus ${apiEndpoint} ./src/utilities/storefront --header=X-Shopify-Storefront-Access-Token:${publicStorefrontToken}`,
  {
    stdio: 'inherit',
  }
);
