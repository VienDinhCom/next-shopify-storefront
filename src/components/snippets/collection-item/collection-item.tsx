import React from 'react';
import NextLink from 'next/link';
import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@material-ui/core';

import { CollectionService } from '@app/services/collection.service';

interface Props {
  collection: CollectionService.Collection;
}

export const CollectionItem: React.FC<Props> = ({ collection }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <NextLink href={collection.url} passHref>
        <CardActionArea sx={{ display: 'block', height: '100%' }}>
          <CardMedia height={500} image={collection.image.src} alt={collection.image.alt} component="img" />
          <CardContent>
            <Typography gutterBottom variant="h6" component="h3">
              {collection.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {collection.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </NextLink>
    </Card>
  );
};
