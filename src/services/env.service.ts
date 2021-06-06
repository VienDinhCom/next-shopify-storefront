export namespace EnvService {
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
