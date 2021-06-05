import React, { Fragment } from 'react';
import { UseInfiniteQueryResult } from 'react-query';
import { InfiniteButton } from '@app/components/buttons/infinite-button';
import { GetProductListQuery } from '@app/services/product.service';

type Props = UseInfiniteQueryResult<GetProductListQuery>;

const ProductList: React.FC<Props> = ({ data, fetchNextPage, hasNextPage, isFetchingNextPage }) => {
  return (
    <Fragment>
      {data.pages.map((group, i) => (
        <Fragment key={i}>
          {group.products.edges.map(({ node }) => {
            return <li key={node.id}>{node.title}</li>;
          })}
        </Fragment>
      ))}
      <InfiniteButton fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
    </Fragment>
  );
};

export { ProductList };
