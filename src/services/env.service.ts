export namespace envService {
  export function isServer() {
    return !process.browser;
  }

  export function isBrowser() {
    return process.browser;
  }
}
