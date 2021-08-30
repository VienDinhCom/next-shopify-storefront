import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import { CartService } from '@app/services/cart.service';
import { IntlService } from '@app/services/intl.service';

interface Props {
  cart: CartService.Cart;
}

interface State {}

export const Cart: React.FC<Props> = ({ cart }) => {
  return (
    <TableContainer component={Card}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Quantity
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Price
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cart.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell component="th" scope="row">
                {item.title}
              </TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">{IntlService.formatPrice(item.variant.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
    </TableContainer>
  );
};
