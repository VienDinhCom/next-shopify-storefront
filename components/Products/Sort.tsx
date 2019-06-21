import React from 'react';
import queryString from 'query-string';
import Router from 'next/router';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ProductSortKeys } from '../../models';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 80
    }
  })
);

const sortOpts = [
  {
    name: 'Best Selling',
    sortKey: 'best_selling',
    reverse: false
  },
  {
    name: 'Newest',
    sortKey: 'created_at',
    reverse: true
  },
  {
    name: 'Oldest',
    sortKey: 'created_at',
    reverse: false
  },
  {
    name: 'Price (Low > High)',
    sortKey: 'price',
    reverse: false
  },
  {
    name: 'Price (High > Low)',
    sortKey: 'price',
    reverse: true
  },
  {
    name: 'Title (A - Z)',
    sortKey: 'title',
    reverse: false
  },
  {
    name: 'Title (Z - A)',
    sortKey: 'title',
    reverse: true
  }
];

interface Props {
  query: {
    query: string;
    reverse: boolean;
    sortKey: ProductSortKeys;
    sortIndex: number;
  };
}

function Sort(props: Props) {
  const classes = useStyles();

  function _sort(event) {
    const { router } = Router;
    const sortIndex = event.target.value;
    const { sortKey, reverse } = sortOpts[sortIndex];
    const queryStr = queryString.stringify({ ...props.query, sortKey, reverse, sortIndex });

    router.push(`${router.pathname}?${queryStr}`);
  }

  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor="sort-by">Sort By</InputLabel>
      <Select
        value={props.query.sortIndex}
        onChange={_sort}
        inputProps={{
          id: 'sort-by'
        }}
      >
        {sortOpts.map(({ name }, index) => (
          <MenuItem key={name} value={index}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default Sort;
