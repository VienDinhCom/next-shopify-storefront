import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const apiEndpoint = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT;
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

execSync(
  `node_modules/.bin/zeus ${apiEndpoint} ./src/utilities/storefront --header=X-Shopify-Storefront-Access-Token:${accessToken}`,
  {
    stdio: 'inherit',
  }
);
