import React from 'react';
import title from 'title';
import { useRouter } from 'next/router';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { CardActionArea } from '@material-ui/core';

export interface ProductItemProps {
  handle: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  price: {
    amount: number;
    currencyCode: string;
  };
}

export const ProductItem: React.FC<ProductItemProps> = (props) => {
  const router = useRouter();
  const url = `/products/${props.handle}`;

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        href={url}
        onClick={(event) => {
          event.preventDefault();
          router.push(url);
        }}
      >
        <CardMedia height={500} image={props.image.src} alt={props.image.alt} component="img" />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h3">
            {title(props.title)}
          </Typography>
          <Typography sx={{ color: '#d32f2f' }} gutterBottom variant="body2" component="div">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: props.price.currencyCode }).format(
              props.price.amount
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
