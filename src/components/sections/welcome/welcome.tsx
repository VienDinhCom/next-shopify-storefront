import React from 'react';
import NextLink from 'next/link';
import { Card, CardContent, Button, Typography } from '@material-ui/core';

export const Welcome: React.FC = () => {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography sx={{ marginBottom: '20px', marginTop: '20px' }} gutterBottom variant="h4" component="h1">
          Next Shopify Storefront
        </Typography>
        <Typography
          sx={{ marginBottom: '20px', maxWidth: '600px', display: 'inline-block' }}
          gutterBottom
          variant="body2"
          component="p"
        >
          A <b>Shopping Cart</b> built with <b>TypeScript</b>, <b>Next.js</b>, <b>React.js</b>, <b>React Query</b>,{' '}
          <b>Shopify Storefront GraphQL API</b>, ... and <b>Material UI</b>.
        </Typography>

        <div css={{ marginBottom: '20px' }}>
          <NextLink href="/products" passHref>
            <Button sx={{ margin: '6px' }} variant="contained" color="primary">
              Browse Products
            </Button>
          </NextLink>

          <Button
            sx={{ margin: '6px' }}
            variant="contained"
            color="inherit"
            target="_blank"
            href="https://github.com/maxvien/next-shopify-storefront"
          >
            Get Source Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
