import React from 'react';
import withLayout from '../../hocs/withLayout';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import utilities from '../../utilities';

const useStyles = makeStyles((them: Theme) => ({
  root: {
    textAlign: 'center'
  },
  description: {
    maxWidth: 500,
    margin: '0 auto 20px auto'
  },
  button: {
    margin: '0 10px 15px 10px'
  }
}));

function Home() {
  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <section className={classes.root}>
      <h1>Next Shopify Storefront</h1>
      <p className={classes.description}>
        A Shopping Cart built with TypeScript, NextJS, React, Redux, Apollo Client, Shopify Storefront GraphQL API, ...
        and Material UI.
      </p>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={() => utilities.link({ path: '/products' })}
      >
        Browse Products
      </Button>
      <Button
        variant="contained"
        className={classes.button}
        target="_blank"
        href="https://github.com/Maxvien/next-shopify-storefront"
      >
        Get Source Code
      </Button>
    </section>
  );
}

export default withLayout(Home);
