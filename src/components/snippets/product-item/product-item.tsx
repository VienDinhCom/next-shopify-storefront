import React from 'react';
import title from 'title';
import { useRouter } from 'next/router';
import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@material-ui/core';

import { IntlService } from '@app/services/intl.service';
import { ProductService } from '@app/services/product.service';

interface Props {
  product: ProductService.ListItem;
}

export const ProductItem: React.FC<Props> = ({ product }) => {
  const router = useRouter();
  const url = `/products/${product.handle}`;

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        href={url}
        onClick={(event) => {
          event.preventDefault();
          router.push(url);
        }}
        sx={{ display: 'block', height: '100%' }}
      >
        <CardMedia height={500} image={product.image.src} alt={product.image.alt} component="img" />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h3">
            {title(product.title)}
          </Typography>
          <Typography sx={{ color: '#d32f2f' }} gutterBottom variant="body2" component="div">
            {IntlService.formatPrice(product.price)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
