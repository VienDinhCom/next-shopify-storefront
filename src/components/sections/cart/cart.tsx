import React from 'react';
import title from 'title';
import Link from 'next/link';
import Image from 'next/image';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import { TextLink } from '@app/components/snippets/text-link';
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
            <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Quantity
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Unit Price
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Total Price
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cart.items.map((item) => {
            const unitPrice = item.variant.price;
            const totalPrice: typeof item.variant.price = {
              amount: unitPrice.amount * item.quantity,
              currencyCode: unitPrice.currencyCode,
            };

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <TextLink href={item.variant.url}>
                    <Image
                      src={item.variant.image.src}
                      alt={item.variant.image.alt}
                      width="300"
                      height="400"
                      layout="responsive"
                    />
                  </TextLink>
                </TableCell>
                <TableCell component="th" scope="row">
                  <TextLink href={item.variant.url}>{title(item.title)}</TextLink>
                </TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{IntlService.formatPrice(unitPrice)}</TableCell>
                <TableCell align="right">{IntlService.formatPrice(totalPrice)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <br />
    </TableContainer>
  );
};
