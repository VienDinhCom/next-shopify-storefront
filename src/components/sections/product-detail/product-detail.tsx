import React from 'react';
import title from 'title';
import { useRouter } from 'next/router';
import Card from '@material-ui/core/Card';

export interface ProductDetailProps {
  title: string;
  description: string;
  variants: {
    images: {
      src: string;
      alt: string;
    }[];
    price: {
      amount: number;
      currencyCode: string;
    };
  }[];
}

export const ProductDetail: React.FC<ProductDetailProps> = (props) => {
  return (
    <Card>
      <h1>{title(props.title)}</h1>
    </Card>
  );
};
