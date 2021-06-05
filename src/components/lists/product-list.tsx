import React, { Fragment } from 'react';
import { InfiniteData } from 'react-query';

import { GetProductListQuery } from '@app/services/product.service';

type Props = {
  pages: InfiniteData<GetProductListQuery>['pages'];
};

const ProductList: React.FC<Props> = ({ pages }) => {
  return (
    <Fragment>
      {pages.map((group, i) => (
        <Fragment key={i}>
          {group.products.edges.map(({ node }) => {
            return <li key={node.id}>{node.title}</li>;
          })}
        </Fragment>
      ))}
    </Fragment>
  );
};

export { ProductList };
