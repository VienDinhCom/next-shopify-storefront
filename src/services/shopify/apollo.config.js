const path = require("path");
const envKit = require("env-kit");

const endpoint = envKit.get("SHOPIFY_API_ENDPOINT") + "/graphql.json";
const accessToken = envKit.get("SHOPIFY_ACCESS_TOKEN");

const generated = path.join(__dirname, "generated.ts");
const documents = path.join(__dirname, "graphql/**/*.gql");

module.exports = {
  client: {
    service: {
      name: "shopify",
      url: endpoint,
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    },
    excludes: [generated],
    includes: [documents],
  },
};
