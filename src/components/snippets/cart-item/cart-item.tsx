import React from 'react';
import title from 'title';
import Image from 'next/image';
import { useImmer } from 'use-immer';
import { useDebounce } from 'react-use';
import { useQueryClient, useMutation } from 'react-query';

import { Delete } from '@material-ui/icons';
import { TableCell, TableRow, IconButton, TextField } from '@material-ui/core';
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

  function refetchCart() {
    queryClient.invalidateQueries(CART_QUERY);
    queryClient.invalidateQueries(CART_ITEM_COUNT_QUERY);
  }

  const updateQuantity = useMutation(
    (quantity: number) => {
      return CartService.updateItem({ id: item.id, quantity });
    },
    {
      onSuccess: refetchCart,
      onError: () => {
        setState((draft) => {
          draft.quantity = item.quantity;
        });
      },
    }
  );

  const remove = useMutation(CartService.removeItem, {
    onSuccess: refetchCart,
  });

  useDebounce(
    () => {
      if (item.quantity !== state.quantity) {
        updateQuantity.mutateAsync(state.quantity);
      }
    },
    2000,
    [state.quantity, item.quantity]
  );

  const disabled = updateQuantity.isLoading || remove.isLoading;

  return (
    <TableRow key={item.id}>
      <TableCell>
        <TextLink href={item.variant.url}>
          <Image src={item.variant.image.src} alt={item.variant.image.alt} width={30} height={40} />
        </TextLink>
      </TableCell>
      <TableCell component="th" scope="row">
        <TextLink href={item.variant.url} sx={{ whiteSpace: 'nowrap' }}>
          {title(item.title)} ({item.variant.title})
        </TextLink>
      </TableCell>
      <TableCell align="center">
        <TextField
          sx={{ width: '80px' }}
          type="number"
          size="small"
          disabled={disabled}
          value={state.quantity}
          onChange={(event) => {
            setState((draft) => {
              draft.quantity = Number(event.target.value) || 1;
            });
          }}
        />
      </TableCell>
      <TableCell align="center">{IntlService.formatPrice(item.variant.price)}</TableCell>
      <TableCell align="center">
        {IntlService.formatPrice({
          amount: item.variant.price.amount * item.quantity,
          currencyCode: item.variant.price.currencyCode,
        })}
      </TableCell>
      <TableCell align="right">
        <IconButton disabled={disabled} onClick={() => remove.mutateAsync(item.id)}>
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
