export default function Error({ statusCode }) {
  if (statusCode === 404) {
    return <h1>Error: 404</h1>;
  }

  if (statusCode === 500) {
    return <h1>Error: 500</h1>;
  }

  return <h1>Error: Client</h1>;
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  return { statusCode };
};
