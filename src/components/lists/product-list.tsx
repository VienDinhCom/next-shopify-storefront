import React, { Fragment } from 'react';
import { UseInfiniteQueryResult } from 'react-query';
import { InfiniteButton } from '@app/components/buttons/infinite-button';
import { GetProductListQuery } from '@app/services/product.service';
import { ProductItem } from '@app/components/items/product-item';

type Props = UseInfiniteQueryResult<GetProductListQuery>;

const ProductList: React.FC<Props> = ({ data, fetchNextPage, hasNextPage, isFetchingNextPage }) => {
  return (
    <Fragment>
      {data.pages.map((group, i) => (
        <Fragment key={i}>
          {group.products.edges.map(({ node }) => {
            const { altText, transformedSrc } = node.images.edges[0]?.node;
            const image = { src: transformedSrc, altText };

            return (
              <ProductItem
                key={node.id}
                handle={node.handle}
                title={node.title}
                description={node.description}
                image={image}
                price={node.priceRange.minVariantPrice}
              />
            );
          })}
        </Fragment>
      ))}
      <InfiniteButton fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
    </Fragment>
  );
};

export { ProductList };
