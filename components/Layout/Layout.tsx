import Head from 'next/head';
import React from 'react';
import Container from '@material-ui/core/Container';
import AppBar from './AppBar';

interface Props {
  children;
}

function Layout({ children }: Props) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
        <meta name="theme-color" content="#556cd6" />
        <link rel="icon" href="https://reactjs.org/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <title>Next Shopify Storefront</title>
        <meta
          name="description"
          content="A shopping cart built with TypeScript, NextJS, React, Redux, Apollo Client, Shopify Storefront GraphQL, ... and Material UI."
        />
      </Head>
      <AppBar />
      <br />
      <br />
      <br />
      <br />
      <Container>{children}</Container>
    </>
  );
}

export default Layout;
