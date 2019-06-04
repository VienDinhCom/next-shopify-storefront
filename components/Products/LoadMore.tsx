import React, { useState } from 'react';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import services from '../../services';
import { ProductSortKeys } from '../../models';

// props.dispatch(
//   services.products.getNextPage({
//     ...props.query,
//     cursor
//   })
// );

// function LoadMore(params:type) {
//   return(<td colSpan={3} align="center">
//     {props.products.nextPage.error && <p>Error: {props.products.nextPage.error}</p>}
//     <button disabled={!props.products.data.pageInfo.hasNextPage} onClick={_getNextPage}>
//       {props.products.nextPage.loading ? 'Loading' : props.products.nextPage.error ? 'Try Again' : 'Load More'}
//     </button>
//   </td>)
// }

const useStyles = makeStyles(theme => ({
  root: {
    padding: '30px 0',
    textAlign: 'center'
  }
}));

interface Props {
  cursor: string;
  hasNextpage: boolean;
  loading: boolean;
  error: Error;
  dispatch: Function;
  query: {
    query: string;
    reverse: boolean;
    sortKey: ProductSortKeys;
    sortIndex: number;
  };
}

function LoadMore({ cursor, hasNextpage, loading, error, dispatch, query }: Props) {
  const classes = useStyles();
  const [snackbar, setSnackbar] = useState(true);

  function _load() {
    dispatch(
      services.products.getNextPage({
        cursor,
        ...query
      })
    );
  }

  if (loading) {
    return (
      <div className={classes.root}>
        <CircularProgress size={24} />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Button variant="contained" color={error ? 'secondary' : 'primary'} disabled={!hasNextpage} onClick={_load}>
        {error ? 'Try Again' : 'Load More'}
      </Button>
    </div>
  );
}

export default LoadMore;
