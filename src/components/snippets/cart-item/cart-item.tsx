import React from 'react';
import title from 'title';
import Image from 'next/image';
import { useImmer } from 'use-immer';
import { useDebounce } from 'react-use';
import { useQueryClient, useMutation } from 'react-query';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';

import { TextLink } from '@app/components/snippets/text-link';

import { CART_ITEM_COUNT_QUERY, CART_QUERY } from '@app/constants/query.constant';
import { CartService } from '@app/services/cart.service';
import { IntlService } from '@app/services/intl.service';

interface Props {
  item: CartService.CartItem;
}

interface State {
  quantity: number;
}

export const CartItem: React.FC<Props> = ({ item }) => {
  const queryClient = useQueryClient();
  const [state, setState] = useImmer<State>({ quantity: item.quantity });

  const updateQuantity = useMutation(
    (quantity: number) => {
      return CartService.updateItem({ id: item.id, quantity });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CART_QUERY);
        queryClient.invalidateQueries(CART_ITEM_COUNT_QUERY);
      },
      onError: () => {
        setState((draft) => {
          draft.quantity = item.quantity;
        });
      },
    }
  );

  const remove = useMutation(CartService.removeItem, {
    onSuccess: () => {
      queryClient.invalidateQueries(CART_QUERY);
      queryClient.invalidateQueries(CART_ITEM_COUNT_QUERY);
    },
  });

  useDebounce(
    () => {
      updateQuantity.mutateAsync(state.quantity);
    },
    2000,
    [state.quantity]
  );

  return (
    <TableRow key={item.id}>
      <TableCell>
        <TextLink href={item.variant.url}>
          <Image src={item.variant.image.src} alt={item.variant.image.alt} width={30} height={40} />
        </TextLink>
      </TableCell>
      <TableCell component="th" scope="row">
        <TextLink href={item.variant.url}>
          {title(item.title)} ({item.variant.title})
        </TextLink>
      </TableCell>
      <TableCell align="right">
        <TextField
          type="number"
          size="small"
          inputProps={{ min: 1 }}
          value={state.quantity}
          onChange={(event) => {
            setState((draft) => {
              draft.quantity = Number(event.target.value) || 1;
            });
          }}
        />
      </TableCell>
      <TableCell align="right">{IntlService.formatPrice(item.variant.price)}</TableCell>
      <TableCell align="right">
        {IntlService.formatPrice({
          amount: item.variant.price.amount * item.quantity,
          currencyCode: item.variant.price.currencyCode,
        })}
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={() => remove.mutateAsync(item.id)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
