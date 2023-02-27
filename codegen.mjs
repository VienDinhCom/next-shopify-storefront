import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const endpoint = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

execSync(
  `node_modules/.bin/zeus ${endpoint} ./src/utilities/storefront --header=X-Shopify-Storefront-Access-Token:${token}`,
  {
    stdio: 'inherit',
  }
);
