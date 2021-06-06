type Variable = 'NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_ENDPOINT' | 'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN';

export namespace EnvService {
  export function get(variable: Variable) {
    return process.env[variable]!;
  }

  export function isNode() {
    return !process.browser;
  }

  export function isBrowser() {
    return process.browser;
  }

  export function isDev() {
    return process.env.NODE_ENV === 'development';
  }

  export function isProd() {
    return process.env.NODE_ENV === 'production';
  }
}
