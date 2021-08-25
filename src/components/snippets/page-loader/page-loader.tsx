import React from 'react';
import Button from '@material-ui/core/Button';
import { styled } from '@material-ui/system';
import { UseInfiniteQueryResult } from 'react-query';

const Wrapper = styled('div')(({ theme }) => ({
  textAlign: 'center',
}));

export type PageLoaderProps = Pick<
  UseInfiniteQueryResult,
  'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage' | 'error'
>;

export const PageLoader: React.FC<PageLoaderProps> = (props) => {
  return (
    <Wrapper>
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
    </Wrapper>
  );
};
