import React from 'react';
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
}

export const ProductItem: React.FC<ProductItemProps> = (props) => {
  const router = useRouter();
  const url = `/products/${props.handle}`;

  return (
    <Card>
      <CardActionArea
        href={url}
        onClick={(event) => {
          event.preventDefault();
          router.push(url);
        }}
      >
        <CardMedia
          sx={{ height: 350, objectFit: 'contain' }}
          image={props.image.src}
          alt={props.image.alt}
          component="img"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {props.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
