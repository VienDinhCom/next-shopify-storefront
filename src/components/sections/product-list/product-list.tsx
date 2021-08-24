import React from 'react';
import { ProductItemProps, ProductItem } from '@app/components/snippets/product-item';

interface ProductItem extends ProductItemProps {
  id: string;
}

export interface ProductListProps {
  products: ProductItem[];
}

export const ProductList: React.FC<ProductListProps> = (props) => {
  return (
    <React.Fragment>
      {props.products.map((props) => (
        <ProductItem key={props.id} {...props} />
      ))}
    </React.Fragment>
  );
};
