import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import services from '../../services';
import { ProductSortKeys } from '../../models';

const useStyles = makeStyles(() => ({
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
