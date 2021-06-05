import React from 'react';
import { UseInfiniteQueryResult } from 'react-query';

type Props = Pick<UseInfiniteQueryResult, 'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage'>;

const InfiniteButton: React.FC<Props> = ({ fetchNextPage, hasNextPage, isFetchingNextPage }) => {
  return (
    <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
      {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load More' : 'Nothing more to load'}
    </button>
  );
};

export { InfiniteButton };
