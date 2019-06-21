const dev = process.env.NODE_ENV !== 'production';

let config = {};

if (dev) {
  const withTypescript = require("@zeit/next-typescript")
  const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

  config = withTypescript({
    webpack(config, options) {
      // Do not run type checking twice:
      if (options.isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin())

      return config
    }
  });
}

module.exports = config;
