import _ from 'lodash';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import React from 'react';
import InfoIcon from '@material-ui/icons/Info';
import { ProductsState } from '../../store/products.slice';
import Layout from '../Layout/Layout';
import LoadMore from './LoadMore';
import Sort from './Sort';
import { ProductSortKeys } from '../../models';

interface Props {
  products: ProductsState;
  dispatch: Function;
  query: {
    query: string;
    reverse: boolean;
    sortKey: ProductSortKeys;
    sortIndex: number;
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    width: 500,
    height: 450
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center'
  },
  title: {
    margin: 0
  }
}));

function Products({ products, query, dispatch }: Props) {
  const { firstPage, nextPage, data } = products;
  const cursor = data ? _.last(data.edges).cursor : '';
  const hasNextpage = data ? data.pageInfo.hasNextPage : false;
  const classes = useStyles();
  const theme = useTheme();
  let gridListCols = 4;

  if (useMediaQuery(theme.breakpoints.down('md'))) {
    gridListCols = 3;
  }

  if (useMediaQuery(theme.breakpoints.down('sm'))) {
    gridListCols = 2;
  }

  if (useMediaQuery(theme.breakpoints.down('xs'))) {
    gridListCols = 1;
  }

  return (
    <Layout>
      <header className={classes.header}>
        <h1 className={classes.title}>Products</h1>
        <Sort query={query} />
      </header>

      {firstPage.loading && <p>Loading...</p>}

      {firstPage.error && <p>{firstPage.error.message}</p>}

      {data && (
        <div className={classes.root}>
          <GridList cellHeight={500} cols={gridListCols} spacing={30}>
            {data.edges.map(({ node }) => (
              <GridListTile key={node.handle}>
                <img src={node.images.edges[0].node.transformedSrc} alt={node.images.edges[0].node.altText} />
                <GridListTileBar
                  title={node.title}
                  subtitle={
                    <span>
                      {node.priceRange.minVariantPrice.amount} {node.priceRange.minVariantPrice.currencyCode}
                    </span>
                  }
                  actionIcon={
                    <IconButton className={classes.icon}>
                      <InfoIcon />
                    </IconButton>
                  }
                />
              </GridListTile>
            ))}
          </GridList>
          <LoadMore cursor={cursor} hasNextpage={hasNextpage} query={query} dispatch={dispatch} {...nextPage} />
        </div>
      )}
    </Layout>
  );
}

export default Products;
