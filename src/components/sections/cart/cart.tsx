import React from 'react';
import { Card, TableContainer, Typography, Table, TableBody, TableRow, TableCell, Button } from '@material-ui/core';

import { CartList } from '@app/components/snippets/cart-list';

import { CartService } from '@app/services/cart.service';
import { IntlUtility } from '@app/utilities/intl.utility';

interface Props {
  cart: CartService.Cart;
}

export const Cart: React.FC<Props> = ({ cart }) => {
  return (
    <section>
      <Typography sx={{ marginBottom: '20px' }} gutterBottom variant="h5" component="h1">
        Cart
      </Typography>
      <TableContainer sx={{ marginBottom: '20px' }} component={Card}>
        <CartList items={cart.items}></CartList>
      </TableContainer>
      <TableContainer component={Card}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}
                align="right"
                width="100%"
              >
                Subtotal is <span css={{ color: '#d32f2f' }}>{IntlUtility.formatPrice(cart.subtotal)}</span>
              </TableCell>
              <TableCell
                sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}
                align="right"
                width="100%"
              >
                Tax is <span css={{ color: '#d32f2f' }}>{IntlUtility.formatPrice(cart.tax)}</span>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }} align="right" width="100%">
                Total is <span css={{ color: '#d32f2f' }}>{IntlUtility.formatPrice(cart.total)}</span>
              </TableCell>
              <TableCell align="right">
                <Button href={cart.url} target="_blank" variant="contained">
                  Checkout
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
};
