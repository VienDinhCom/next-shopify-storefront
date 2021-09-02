import React from 'react';
import NextLink from 'next/link';
import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@material-ui/core';

import { IntlService } from '@app/services/intl.service';
import { ProductService } from '@app/services/product.service';

interface Props {
  product: ProductService.ListItem;
}

export const ProductItem: React.FC<Props> = ({ product }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <NextLink href={product.url} passHref>
        <CardActionArea sx={{ display: 'block', height: '100%' }}>
          <CardMedia height={500} image={product.image.src} alt={product.image.alt} component="img" />
          <CardContent>
            <Typography gutterBottom variant="h6" component="h3">
              {product.title}
            </Typography>
            <Typography sx={{ color: '#d32f2f' }} gutterBottom variant="body2" component="div">
              {IntlService.formatPrice(product.price)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {product.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </NextLink>
    </Card>
  );
};
