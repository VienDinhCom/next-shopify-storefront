import React from 'react';
import queryString from 'query-string';
import Router from 'next/router';
import TextField from '@material-ui/core/TextField';
import { ProductSortKeys } from '../../models';

interface Props {
  query: {
    query: string;
    reverse: boolean;
    sortKey: ProductSortKeys;
    sortIndex: number;
  };
}

let timeoutID;

function Search(props: Props) {
  function _search(event) {
    const { router } = Router;
    const query = event.target.value;
    const queryStr = queryString.stringify({ ...props.query, query });

    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => router.push(`${router.pathname}?${queryStr}`), 1000);
  }

  return <TextField label="Search" defaultValue={props.query.query} onChange={_search} margin="normal" />;
}

export default Search;
