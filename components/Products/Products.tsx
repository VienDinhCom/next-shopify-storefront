import _ from 'lodash';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import React from 'react';
import InfoIcon from '@material-ui/icons/Info';
import { ProductsState } from '../../store/products.slice';
import Layout from '../Layout/Layout';
import LoadMore from './LoadMore';
import Sort from './Sort';
import Search from './Search';
import { ProductSortKeys } from '../../models';
import utilities from '../../utilities';

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
  products: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    // width: '100%'
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 30,
    alignItems: 'center'
  },
  empty: {
    display: 'block',
    width: '100%',
    textAlign: 'center'
  },
  loader: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    marginBottom: 30
  }
}));

function Products({ products, query, dispatch }: Props) {
  const { firstPage, nextPage, data } = products;
  const cursor = data ? (data.edges.length ? _.last(data.edges).cursor : '') : '';
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
        <Search query={query} />
        <Sort query={query} />
      </header>

      {firstPage.loading && (
        <div className={classes.loader}>
          <CircularProgress size={24} />
        </div>
      )}

      {firstPage.error && <p>{firstPage.error.message}</p>}

      {data && (
        <>
          <div className={classes.products}>
            <GridList className={classes.gridList} cellHeight={500} cols={gridListCols} spacing={30}>
              {data.edges.map(({ node }) => {
                const images = node.images.edges;
                const imageSrc = images.length
                  ? images[0].node.transformedSrc
                  : 'http://www.netum.vn/public/default/img/icon/default-product-image.png';
                const altText = images.length ? images[0].node.altText : '';

                return (
                  <GridListTile key={node.handle}>
                    <img src={imageSrc} alt={altText} />
                    <GridListTileBar
                      title={node.title}
                      subtitle={
                        <span>
                          {node.priceRange.minVariantPrice.amount} {node.priceRange.minVariantPrice.currencyCode}
                        </span>
                      }
                      actionIcon={
                        <IconButton
                          className={classes.icon}
                          onClick={() =>
                            utilities.link({
                              path: '/product',
                              params: {
                                handle: node.handle
                              }
                            })
                          }
                        >
                          <InfoIcon />
                        </IconButton>
                      }
                    />
                  </GridListTile>
                );
              })}
            </GridList>
          </div>
          {data.edges.length > 0 && (
            <LoadMore cursor={cursor} hasNextpage={hasNextpage} query={query} dispatch={dispatch} {...nextPage} />
          )}
          {data.edges.length === 0 && firstPage.loading === false && (
            <p className={classes.empty}>
              Your search - <strong>{query.query}</strong> - did not match any products.
            </p>
          )}
        </>
      )}
    </Layout>
  );
}

export default Products;
