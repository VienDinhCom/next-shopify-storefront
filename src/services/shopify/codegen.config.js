const path = require('path');

const schema = path.join(__dirname, 'schema.gql');
const generated = path.join(__dirname, 'generated.ts');
const documents = path.join(__dirname, 'graphql/**/*.gql');

module.exports = {
  overwrite: true,
  generates: {
    [generated]: {
      schema,
      documents,
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
    },
  },
};
