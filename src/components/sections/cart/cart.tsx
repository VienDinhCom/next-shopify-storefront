import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import { CartService } from '@app/services/cart.service';

interface Props {
  cart: CartService.Cart;
}

interface State {}

export const Cart: React.FC<Props> = ({ cart }) => {
  console.log(cart.items);

  return (
    <TableContainer component={Card}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cart.items.map((item) => {
            <TableRow key={item.id}>
              <TableCell component="th" scope="row">
                {item.title}
              </TableCell>
              <TableCell align="right">dfdfd</TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>
      <br />
    </TableContainer>
  );
};
