import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import { CartService } from '@app/services/cart.service';
import { CartItem } from '@app/components/snippets/cart-item';

interface Props {
  items: CartService.CartItem[];
}

export const CartList: React.FC<Props> = ({ items }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }} align="center">
            Quantity
          </TableCell>
          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }} align="center">
            Unit Price
          </TableCell>
          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }} align="center">
            Total Price
          </TableCell>
          <TableCell sx={{ fontWeight: 'bold' }} align="right">
            Remove
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </TableBody>
    </Table>
  );
};
