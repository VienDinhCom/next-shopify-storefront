import React from 'react';
import { Grid } from '@material-ui/core';
import { UseInfiniteQueryResult } from 'react-query';
import { PageLoader } from '@app/components/snippets/page-loader';
import { ProductItem } from '@app/components/snippets/product-item';
import { ProductService } from '@app/services/product.service';
import { CollectionService } from '@app/services/collection.service';
import { CollectionItem } from '@app/components/snippets/collection-item';

export interface Props {
  collections: CollectionService.Collection[];
  pagination: Pick<UseInfiniteQueryResult, 'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage' | 'error'>;
}

export const CollectionList: React.FC<Props> = ({ collections, pagination }) => {
  return (
    <div>
      <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
        {collections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={collection.id}>
            <CollectionItem collection={collection} />
          </Grid>
        ))}
      </Grid>
      <PageLoader {...pagination} />
    </div>
  );
};
