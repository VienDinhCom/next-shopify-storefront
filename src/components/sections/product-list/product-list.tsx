import React from 'react';
import Grid from '@material-ui/core/Grid';
import { ProductItemProps, ProductItem } from '@app/components/snippets/product-item';

interface ProductItem extends ProductItemProps {
  id: string;
}

export interface ProductListProps {
  products: ProductItem[];
}

export const ProductList: React.FC<ProductListProps> = (props) => {
  return (
    <Grid container spacing={3}>
      {props.products.map((props) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={props.id}>
          <ProductItem {...props} />
        </Grid>
      ))}
    </Grid>
  );
};
