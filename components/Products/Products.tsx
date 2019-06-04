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

interface Props {
  products: ProductsState;
  dispatch: Function;
  query: {
    query: string;
    reverse: boolean;
    sortKey: string;
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
  }
}));

function Products(props: Props) {
  const { firstPage, nextPage, data } = props.products;
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
      <h1>Products</h1>

      {firstPage.loading && <p>Loading...</p>}

      {firstPage.error && <p>{firstPage.error.message}</p>}

      {data && (
        <>
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
          <LoadMore />
        </>
      )}
    </Layout>
  );
}

export default Products;
