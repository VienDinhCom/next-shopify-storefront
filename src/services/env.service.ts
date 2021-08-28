export namespace EnvService {
  export function isNode(): boolean {
    return !process.browser;
  }

  export function isBrowser(): boolean {
    return process.browser;
  }

  export function isDev(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  export function isProd(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}
