import React from 'react';
import title from 'title';
import { useRouter } from 'next/router';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { CardActionArea } from '@material-ui/core';
import { IntlService } from '@app/services/intl.service';
import { ProductService } from '@app/services/product.service';

type Props = ProductService.ListItem;

export const ProductItem: React.FC<Props> = (props) => {
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
        sx={{ display: 'block', height: '100%' }}
      >
        <CardMedia height={500} image={props.image.src} alt={props.image.alt} component="img" />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h3">
            {title(props.title)}
          </Typography>
          <Typography sx={{ color: '#d32f2f' }} gutterBottom variant="body2" component="div">
            {IntlService.formatPrice(props.price)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
