import React from 'react';
import { Button } from '@material-ui/core';
import { UseInfiniteQueryResult } from 'react-query';

export type PageLoaderProps = Pick<
  UseInfiniteQueryResult,
  'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage' | 'error'
>;

export const PageLoader: React.FC<PageLoaderProps> = (props) => {
  return (
    <div css={{ textAlign: 'center' }}>
      {(() => {
        if (props.isFetchingNextPage) {
          return <Button color="warning">Loading...</Button>;
        }

        if (props.error) {
          return (
            <Button onClick={() => props.fetchNextPage()} color="error">
              Try Again to Load More
            </Button>
          );
        }

        if (props.hasNextPage) {
          return <Button onClick={() => props.fetchNextPage()}>Load More</Button>;
        }

        return <Button disabled>Nothing more to load</Button>;
      })()}
    </div>
  );
};
