import React from 'react';
import title from 'title';
import Card from '@material-ui/core/Card';

export interface ProductSingleProps {
  title: string;
  description: string;
  variants: {
    price: {
      amount: number;
      currencyCode: string;
    };
    image?: {
      src: string;
      alt: string;
    };
  }[];
}

export const ProductSingle: React.FC<ProductSingleProps> = (props) => {
  return (
    <Card>
      <h1>{title(props.title)}</h1>
    </Card>
  );
};
