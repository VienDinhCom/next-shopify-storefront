import React from 'react';
import Grid from '@material-ui/core/Grid';
import { UseInfiniteQueryResult } from 'react-query';
import { PageLoader } from '@app/components/snippets/page-loader';
import { ProductItem } from '@app/components/snippets/product-item';
import { ProductService } from '@app/services/product.service';

export interface Props {
  products: ProductService.ListItem[];
  pagination: Pick<UseInfiniteQueryResult, 'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage' | 'error'>;
}

export const ProductList: React.FC<Props> = (props) => {
  return (
    <div>
      <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
        {props.products.map((props) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={props.id}>
            <ProductItem {...props} />
          </Grid>
        ))}
      </Grid>
      <PageLoader {...props.pagination} />
    </div>
  );
};
